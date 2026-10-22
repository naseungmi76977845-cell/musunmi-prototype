import type {HolisticLandmarker,HolisticLandmarkerResult,NormalizedLandmark} from '@mediapipe/tasks-vision';
import type {Point,LandmarkFrame} from './realtime-landmarks';
import moduleLoaderUrl from '@mediapipe/tasks-vision/vision_wasm_module_internal.js?url';
import moduleBinaryUrl from '@mediapipe/tasks-vision/vision_wasm_module_internal.wasm?url';

// Shared by the worker and the fallback. Missing detections remain empty;
// zero-filled synthetic detections would change the inference input semantics.
function points(groups:NormalizedLandmark[][],count:number):Point[] {
  const values=groups[0]??[];
  if(!values.length)return [];
  if(values.length!==count)throw new Error(`랜드마크 개수가 올바르지 않습니다 (${values.length}/${count}).`);
  return values.map(({x,y,z,visibility})=>{
    if(![x,y,z].every(Number.isFinite)||(visibility!==undefined&&!Number.isFinite(visibility)))throw new Error('랜드마크에 유효하지 않은 좌표가 있습니다.');
    return visibility===undefined?{x,y,z}:{x,y,z,visibility};
  });
}
export function normalizeLandmarks(result:HolisticLandmarkerResult,timestampMs:number):LandmarkFrame {
  return {timestampMs,leftHand:points(result.leftHandLandmarks,21),rightHand:points(result.rightHandLandmarks,21),pose:points(result.poseLandmarks,33),face:points(result.faceLandmarks,478)};
}
export async function loadHolistic(inWorker:boolean):Promise<HolisticLandmarker> {
  const {FilesetResolver,HolisticLandmarker}=await import('@mediapipe/tasks-vision');
  const files=await FilesetResolver.forVisionTasks('/mediapipe/wasm',inWorker);
  // Let Vite serve/bundle the ES module loader as an asset. Dynamically
  // importing a public/ module is blocked by Vite's development server.
  if(inWorker){
    files.wasmLoaderPath=new URL(moduleLoaderUrl,import.meta.url).href;
    files.wasmBinaryPath=new URL(moduleBinaryUrl,import.meta.url).href;
  }
  return HolisticLandmarker.createFromOptions(files,{
    baseOptions:{modelAssetPath:'/mediapipe/holistic_landmarker.task',delegate:'CPU'},
    runningMode:'VIDEO',outputFaceBlendshapes:false,outputPoseSegmentationMasks:false,
    ...(inWorker?{canvas:new OffscreenCanvas(1,1)}:{}),
  });
}

if(typeof document==='undefined'){

const scope=self as unknown as {onmessage:((event:MessageEvent)=>void)|null;postMessage:(message:unknown)=>void};
let model:HolisticLandmarker|null=null;
let initializing=false;
scope.onmessage=event=>{
  const data=event.data;
  if(data.type==='init'){
    if(initializing||model)return;
    initializing=true;
    void loadHolistic(true).then(value=>{model=value;scope.postMessage({type:'ready'});},error=>scope.postMessage({type:'error',error:error instanceof Error?error.message:'랜드마크 모델을 불러오지 못했습니다.'}));
    return;
  }
  if(data.type!=='frame')return;
  const bitmap=data.bitmap as ImageBitmap;
  try{
    if(!model)throw new Error('랜드마크 모델이 준비되지 않았습니다.');
    const frame=normalizeLandmarks(model.detectForVideo(bitmap,data.timestampMs),data.timestampMs);
    scope.postMessage({type:'result',frame});
  }catch(error){scope.postMessage({type:'error',error:error instanceof Error?error.message:'랜드마크 추출에 실패했습니다.'});}
  finally{bitmap.close();}
};

}

