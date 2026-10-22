import type {LandmarkFrame} from './realtime-landmarks';
// Proposed transport contract: reconcile this adapter with the server before setting its URL.
export type SignCandidate={id?:string;label:string;score:number};
export type InferenceWindow={schemaVersion:1;sessionId:string;requestId:string;image:{width:number;height:number};coordinates:{space:'normalized';mirrored:false};frames:LandmarkFrame[]};
export function parseInferenceResponse(value:unknown,requestId:string):SignCandidate[]{
 if(!value||typeof value!=='object')throw new Error('invalid_response');const v=value as Record<string,unknown>;
 if(v.requestId!==requestId||!Array.isArray(v.candidates)||v.candidates.length>20)throw new Error('invalid_response');const seen=new Set<string>();
 return v.candidates.map(item=>{if(!item||typeof item!=='object')throw new Error('invalid_response');const c=item as Record<string,unknown>;
 if(typeof c.label!=='string'||!c.label.trim()||c.label.length>80||typeof c.score!=='number'||!Number.isFinite(c.score)||c.score<0||c.score>1||(c.id!==undefined&&(typeof c.id!=='string'||c.id.length>100)))throw new Error('invalid_response');
 return {label:c.label.trim(),score:c.score,...(typeof c.id==='string'?{id:c.id}:{})};}).filter(c=>{if(seen.has(c.label))return false;seen.add(c.label);return true}).sort((a,b)=>b.score-a.score).slice(0,3);
}
export function inferenceEndpoint(value:string,origin:string){if(!value.trim())return null;try{const url=new URL(value,origin);if(url.username||url.password||url.hash||url.search)return null;const local=['localhost','127.0.0.1','[::1]'];if(url.protocol!=='https:'&&!(url.protocol==='http:'&&local.includes(url.hostname)&&local.includes(new URL(origin).hostname)))return null;return url.href}catch{return null}}
export async function inferSignWindow(endpoint:string,payload:InferenceWindow,signal:AbortSignal){const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',redirect:'error',referrerPolicy:'no-referrer',body:JSON.stringify(payload),signal});if(!response.ok)throw new Error('server_error');return parseInferenceResponse(await response.json(),payload.requestId)}
