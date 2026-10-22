import {useCallback,useEffect,useId,useRef,useState} from 'react';
import {ArrowRight,Camera,CameraOff,Hand,LoaderCircle,ScanLine,Search,ShieldCheck,Square} from 'lucide-react';
import type {Kit} from './contracts';
import {inferenceEndpoint,inferSignWindow,type SignCandidate} from './sign-inference';
import type {LandmarkFrame,Point} from './realtime-landmarks';
import './sign-search-panel.css';

type Extractor=Awaited<ReturnType<typeof import('./realtime-landmarks').createLandmarkExtractor>>;
const SAMPLE_MS=125,WINDOW_SIZE=24;
const handEdges=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[0,17],[17,18],[18,19],[19,20]];
function overlay(canvas:HTMLCanvasElement,frame:LandmarkFrame,width:number,height:number){
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}const ctx=canvas.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,width,height);ctx.strokeStyle='#c8edb6';ctx.fillStyle='#efffe7';ctx.lineWidth=Math.max(2,width/260);
 const draw=(points:Point[],edges:number[][])=>{for(const [a,b]of edges){const p=points[a],q=points[b];if(!p||!q||(p.visibility??1)<.4||(q.visibility??1)<.4)continue;ctx.beginPath();ctx.moveTo(p.x*width,p.y*height);ctx.lineTo(q.x*width,q.y*height);ctx.stroke()}for(const p of points){if((p.visibility??1)<.4)continue;ctx.beginPath();ctx.arc(p.x*width,p.y*height,Math.max(2,width/200),0,Math.PI*2);ctx.fill()}};
 draw(frame.leftHand,handEdges);draw(frame.rightHand,handEdges);draw(frame.pose.slice(0,17),[[11,12],[11,13],[13,15],[12,14],[14,16]]);
}
function cameraMessage(error:unknown){const name=error instanceof Error?error.name:'';if(name==='NotAllowedError'||name==='SecurityError')return '카메라 접근을 허용해 주세요.';if(name==='NotFoundError'||name==='OverconstrainedError')return '사용할 수 있는 카메라가 없어요.';if(name==='NotReadableError')return '다른 앱에서 카메라를 사용 중이에요.';return '카메라를 시작하지 못했어요. 다시 시도해 주세요.'}
export function SignSearchPanel({kit,onTextSearch,onResult}:{kit:Kit;onTextSearch:()=>void;onResult:(candidate:SignCandidate)=>void}){
 const {Button}=kit;const id=useId(),video=useRef<HTMLVideoElement>(null),canvas=useRef<HTMLCanvasElement>(null);
 const stream=useRef<MediaStream|null>(null),extractor=useRef<Extractor|null>(null),run=useRef(0),raf=useRef(0),request=useRef<AbortController|null>(null),initialization=useRef<AbortController|null>(null),requestTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const [phase,setPhase]=useState<'idle'|'starting'|'live'|'error'>('idle'),[error,setError]=useState(''),[tracking,setTracking]=useState(false),[busy,setBusy]=useState(false),[candidates,setCandidates]=useState<SignCandidate[]>([]),[searched,setSearched]=useState(false),[serverError,setServerError]=useState(false),[agreed,setAgreed]=useState(false);
 const endpoint=inferenceEndpoint(import.meta.env.VITE_SIGN_INFERENCE_URL||'',location.origin);
 const stop=useCallback(()=>{++run.current;initialization.current?.abort();initialization.current=null;cancelAnimationFrame(raf.current);request.current?.abort();request.current=null;if(requestTimer.current)clearTimeout(requestTimer.current);requestTimer.current=null;stream.current?.getTracks().forEach(track=>track.stop());stream.current=null;extractor.current?.close();extractor.current=null;if(video.current)video.current.srcObject=null;const c=canvas.current;c?.getContext('2d')?.clearRect(0,0,c.width,c.height);setPhase('idle');setTracking(false);setBusy(false);setCandidates([]);setSearched(false);setServerError(false)},[]);
 useEffect(()=>{const hidden=()=>{if(document.visibilityState==='hidden')stop()};document.addEventListener('visibilitychange',hidden);return()=>{document.removeEventListener('visibilitychange',hidden);stop()}},[stop]);
 async function start(){
  stop();setError('');if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){setError('카메라를 사용할 수 있는 브라우저에서 열어 주세요.');setPhase('error');return}if(endpoint&&!agreed)return;
  const generation=run.current,sessionId=crypto.randomUUID(),startup=new AbortController();initialization.current=startup;setPhase('starting');let camera:MediaStream|null=null;
  try{
   camera=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'user'},width:{ideal:640},height:{ideal:480}}});
   if(generation!==run.current){camera.getTracks().forEach(track=>track.stop());return}stream.current=camera;for(const track of camera.getVideoTracks())track.onended=()=>{if(generation!==run.current)return;stop();setError('카메라 연결이 끊어졌어요. 다시 켜 주세요.');setPhase('error')};const element=video.current;if(!element)throw new Error('video_unmounted');element.srcObject=camera;await element.play();if(generation!==run.current)return;
   const {createLandmarkExtractor}=await import('./realtime-landmarks');if(generation!==run.current)return;const engine=await createLandmarkExtractor(startup.signal);if(generation!==run.current){engine.close();return}extractor.current=engine;setPhase('live');
   let lastSample=-Infinity,lastVideoTime=-1,lastRequest=-Infinity,frames:LandmarkFrame[]=[],lastHands=-Infinity,requestFailed=false;
   const tick=async(now:number)=>{
    if(generation!==run.current)return;
    try{
     if(element.readyState>=2&&element.currentTime!==lastVideoTime&&now-lastSample>=SAMPLE_MS){
      lastVideoTime=element.currentTime;lastSample=now;const frame=await engine.extract(element,now);if(generation!==run.current)return;
      if(canvas.current)overlay(canvas.current,frame,element.videoWidth,element.videoHeight);const hands=frame.leftHand.length===21||frame.rightHand.length===21;setTracking(hands);
      if(hands)lastHands=now;if(now-lastHands>500){frames=[];setCandidates([]);setSearched(false);request.current?.abort();request.current=null;if(requestTimer.current)clearTimeout(requestTimer.current);requestTimer.current=null;setBusy(false)}else{frames.push(frame);frames=frames.slice(-WINDOW_SIZE)}
      if(endpoint&&hands&&frames.length===WINDOW_SIZE&&!request.current&&now-lastRequest>=1000&&!requestFailed){
       lastRequest=now;const controller=new AbortController();request.current=controller;setBusy(true);const payload={schemaVersion:1 as const,sessionId,requestId:crypto.randomUUID(),image:{width:element.videoWidth,height:element.videoHeight},coordinates:{space:'normalized' as const,mirrored:false as const},frames:[...frames]};
       requestTimer.current=setTimeout(()=>controller.abort(),8000);
       void inferSignWindow(endpoint,payload,controller.signal).then(result=>{if(generation!==run.current||request.current!==controller||controller.signal.aborted)return;setCandidates(result);setSearched(true)}).catch(()=>{if(generation!==run.current||request.current!==controller)return;requestFailed=true;setServerError(true);setCandidates([])}).finally(()=>{if(request.current===controller){if(requestTimer.current)clearTimeout(requestTimer.current);requestTimer.current=null;request.current=null;if(generation===run.current)setBusy(false)}});
      }
     }
     if(generation===run.current)raf.current=requestAnimationFrame(tick);
    }catch{if(generation!==run.current)return;stop();setError('동작을 확인하지 못했어요. 다시 시도해 주세요.');setPhase('error')}
   };raf.current=requestAnimationFrame(tick);
  }catch(e){if(generation!==run.current){camera?.getTracks().forEach(track=>track.stop());return}stop();setError(camera?'동작 확인을 준비하지 못했어요. 다시 시도해 주세요.':cameraMessage(e));setPhase('error')}
 }
 const active=phase==='live'||phase==='starting';
 return <section className="sign-search-panel" aria-labelledby={`${id}-heading`}>
  <header className="ssp-heading"><h1 id={`${id}-heading`}>수어로 찾기</h1><p>카메라에 수어를 보여주세요.</p></header>
  <div className={`ssp-camera${active?' is-active':''}`}>
   <video ref={video} muted autoPlay playsInline aria-hidden={!active} className="ssp-live-video" aria-label="실시간 카메라 미리보기"/>
   <canvas ref={canvas} className="ssp-live-overlay" aria-hidden="true"/>
   {!active&&<div className="ssp-camera-idle"><div className="ssp-person" aria-hidden="true"><ScanLine size={122} strokeWidth={1}/><Hand size={42} strokeWidth={1.5}/></div><b>얼굴과 두 손이 보이게</b><span>상체가 화면 안에 들어오도록 해주세요.</span></div>}
   <div className="ssp-guide" aria-hidden="true"><i/><i/><i/><i/></div>
   {phase==='starting'&&<div className="ssp-loading"><LoaderCircle size={24}/><span>카메라를 준비하고 있어요</span></div>}
   {phase==='live'&&<span className={`ssp-live-badge${tracking?' is-tracking':''}`}><i/>{tracking?'동작 확인 중':'손을 보여주세요'}</span>}
  </div>
  <p className="ssp-privacy"><ShieldCheck size={15}/>영상은 저장하지 않고 기기에서 처리해요.</p>
  {endpoint&&!active&&<label className="ssp-consent"><input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)}/>추출한 좌표를 검색 서버로 보내는 데 동의해요.</label>}
  {error&&<p className="ssp-error" role="alert">{error}</p>}
  <div className="ssp-controls">{active?<Button kind="secondary" onClick={stop}><Square size={16}/>카메라 끄기</Button>:<Button onClick={()=>void start()} disabled={!!endpoint&&!agreed}><Camera size={19}/>{phase==='error'?'다시 켜기':'카메라 켜기'}</Button>}</div>
  {phase==='live'&&<section className="ssp-results" aria-live="polite"><div className="ssp-result-heading"><h2>검색 결과</h2>{busy&&<LoaderCircle size={16} className="ssp-spin"/>}</div>
   {!endpoint||serverError?<div className="ssp-result-empty"><CameraOff size={22}/><p>지금은 실시간 검색을 사용할 수 없어요.</p></div>:candidates.length?<div>{candidates.map(c=><button className="ssp-result-row" key={c.label} onClick={()=>{stop();onResult(c)}}><b>{c.label}</b><span>{Math.round(c.score*100)}%</span><ArrowRight size={17}/></button>)}</div>:<p className="ssp-result-hint">{!tracking?'얼굴과 두 손을 화면에 맞춰주세요.':busy?'수어를 찾고 있어요.':searched?'일치하는 표현을 찾지 못했어요. 다시 보여주세요.':'천천히 수어를 보여주세요.'}</p>}
  </section>}
  <button className="ssp-text-search" onClick={()=>{stop();onTextSearch()}}><Search size={16}/>글자로 찾기<ArrowRight size={16}/></button>
 </section>;
}
