import {loadHolistic,normalizeLandmarks} from './realtime-landmarks.worker';

export type Point = {x:number;y:number;z:number;visibility?:number};
export type LandmarkFrame = {timestampMs:number;leftHand:Point[];rightHand:Point[];pose:Point[];face:Point[]};
export type LandmarkExtractor = {extract(video:HTMLVideoElement,timestampMs:number):Promise<LandmarkFrame>;close():void};

function checkInput(video:HTMLVideoElement,timestampMs:number,lastTimestamp:number){
  if(!Number.isFinite(timestampMs)||timestampMs<0||timestampMs<=lastTimestamp)throw new Error('프레임 시간은 이전 프레임보다 커야 합니다.');
  if(video.readyState<2||!video.videoWidth||!video.videoHeight)throw new Error('카메라 영상이 아직 준비되지 않았습니다.');
}
function cancelled(){return new DOMException('랜드마크 추출이 종료되었습니다.','AbortError');}
type Pending={resolve:(frame:LandmarkFrame)=>void;reject:(error:Error)=>void;timer:ReturnType<typeof setTimeout>};

async function workerExtractor(signal?:AbortSignal):Promise<LandmarkExtractor>{
  if(signal?.aborted)throw cancelled();
  const worker=new Worker(new URL('./realtime-landmarks.worker.ts',import.meta.url),{type:'module'});
  try{
    await new Promise<void>((resolve,reject)=>{
      const cleanup=()=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);};
      const abort=()=>{cleanup();worker.terminate();reject(cancelled());};
      const timer=setTimeout(()=>{cleanup();reject(new Error('랜드마크 작업자 초기화 시간이 초과되었습니다.'));},45000);
      signal?.addEventListener('abort',abort,{once:true});
      worker.onmessage=event=>{cleanup();event.data.type==='ready'?resolve():reject(new Error(event.data.error||'랜드마크 작업자를 초기화하지 못했습니다.'));};
      worker.onerror=event=>{event.preventDefault();cleanup();reject(new Error(event.message||'랜드마크 작업자를 시작하지 못했습니다.'));};
      worker.postMessage({type:'init'});
    });
  }catch(error){worker.terminate();throw error;}
  let closed=false,lastTimestamp=-1,pending:Pending|null=null;
  function fail(error:Error){const current=pending;pending=null;if(current){clearTimeout(current.timer);current.reject(error);}}
  worker.onmessage=event=>{
    if(!pending)return;
    const current=pending;pending=null;clearTimeout(current.timer);
    if(event.data.type==='result')current.resolve(event.data.frame as LandmarkFrame);
    else current.reject(new Error(event.data.error||'랜드마크 추출에 실패했습니다.'));
  };
  worker.onerror=event=>{event.preventDefault();closed=true;fail(new Error(event.message||'랜드마크 작업자가 중단되었습니다.'));worker.terminate();};
  worker.onmessageerror=()=>{closed=true;fail(new Error('랜드마크 결과를 읽을 수 없습니다.'));worker.terminate();};
  return {
    extract(video,timestampMs){
      if(closed)return Promise.reject(cancelled());
      if(pending)return Promise.reject(new Error('이전 프레임을 처리 중입니다.'));
      try{checkInput(video,timestampMs,lastTimestamp);}catch(error){return Promise.reject(error);}
      return new Promise<LandmarkFrame>((resolve,reject)=>{
        const current:Pending={resolve,reject,timer:setTimeout(()=>{closed=true;fail(new Error('랜드마크 추출 시간이 초과되었습니다.'));worker.terminate();},30000)};
        pending=current;
        // Capture unmirrored pixels. CSS mirroring on the preview is not applied.
        void createImageBitmap(video).then(bitmap=>{
          if(closed||pending!==current){bitmap.close();return;}
          try{worker.postMessage({type:'frame',timestampMs,bitmap},[bitmap]);lastTimestamp=timestampMs;}
          catch(error){bitmap.close();fail(error instanceof Error?error:new Error('영상 프레임을 전달하지 못했습니다.'));}
        },error=>fail(error instanceof Error?error:new Error('영상 프레임을 읽지 못했습니다.')));
      });
    },
    close(){if(closed)return;closed=true;fail(cancelled());worker.terminate();},
  };
}

async function mainThreadExtractor(signal?:AbortSignal):Promise<LandmarkExtractor>{
  if(signal?.aborted)throw cancelled();
  const model=await new Promise<Awaited<ReturnType<typeof loadHolistic>>>((resolve,reject)=>{
    let settled=false;
    const cleanup=()=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);};
    const fail=(error:Error)=>{if(settled)return;settled=true;cleanup();reject(error);};
    const abort=()=>fail(cancelled());
    const timer=setTimeout(()=>fail(new Error('랜드마크 모델 초기화 시간이 초과되었습니다.')),45000);
    signal?.addEventListener('abort',abort,{once:true});
    void loadHolistic(false).then(value=>{
      // WASM initialization itself has no cancellation API. If it finishes
      // after cancellation/timeout, immediately dispose the late model.
      if(settled||signal?.aborted){value.close();return;}
      settled=true;cleanup();resolve(value);
    },error=>fail(error instanceof Error?error:new Error('랜드마크 모델을 불러오지 못했습니다.')));
  });
  let closed=false,lastTimestamp=-1,lastStarted=-Infinity,pending:Pending|null=null;
  return {
    extract(video,timestampMs){
      if(closed)return Promise.reject(cancelled());
      if(pending)return Promise.reject(new Error('이전 프레임을 처리 중입니다.'));
      try{checkInput(video,timestampMs,lastTimestamp);}catch(error){return Promise.reject(error);}
      return new Promise<LandmarkFrame>((resolve,reject)=>{
        // Fallback inference is synchronous inside this timer. It is capped at
        // 10 fps, but may still block the main thread for each inference.
        const timer=setTimeout(()=>{
          if(closed)return;
          lastStarted=performance.now();lastTimestamp=timestampMs;
          try{resolve(normalizeLandmarks(model.detectForVideo(video,timestampMs),timestampMs));}
          catch(error){reject(error);}
          finally{pending=null;}
        },Math.max(0,100-(performance.now()-lastStarted)));
        pending={resolve,reject,timer};
      });
    },
    close(){if(closed)return;closed=true;if(pending){clearTimeout(pending.timer);pending.reject(cancelled());pending=null;}model.close();},
  };
}

export async function createLandmarkExtractor(signal?:AbortSignal):Promise<LandmarkExtractor>{
  if(signal?.aborted)throw cancelled();
  if(typeof Worker!=='undefined'&&typeof OffscreenCanvas!=='undefined'&&typeof createImageBitmap==='function'){
    try{const engine=await workerExtractor(signal);if(signal?.aborted){engine.close();throw cancelled();}return engine;}
    catch(error){if(signal?.aborted||(error instanceof Error&&error.name==='AbortError'))throw cancelled();console.warn('랜드마크 작업자 초기화 실패: 메인 스레드 제한 모드로 전환합니다.',error);}
  }
  const engine=await mainThreadExtractor(signal);
  if(signal?.aborted){engine.close();throw cancelled();}
  return engine;
}

