import {getLocalActorId,renewLocalActorId,prepareMyQuestionCleanup} from './questions.ts';

export type Member={id:string;nickname:string;email:string;userType:string;knowledge:string;goals:string[];status:'active'|'suspended'|'withdrawn';createdAt:string;updatedAt:string};
export type ManagedPost={id:string;title:string;body:string;category:string;author:string;ownerId:string;createdAt:string;updatedAt:string;status:'published'|'hidden'};
export type ManagedVideo={id:string;wordId:string|null;title:string;body:string;direction:boolean;dialect:string;author:string;ownerId:string;createdAt:string;status:'published'|'hidden'};
export type ManagedState={members:Member[];posts:ManagedPost[];videos:ManagedVideo[]};
export type ManagedAction=
 |{type:'member';member:Member}
 |{type:'moderateMember';id:string;action:'suspend'|'restore'}
 |{type:'post';post:ManagedPost;actor:string}
 |{type:'video';video:ManagedVideo;actor:string}
 |{type:'moderateContent';kind:'post'|'video';id:string;action:'hide'|'restore'}
 |{type:'remove';kind:'post'|'video';id:string;actor:string}
 |{type:'withdraw';actor:string;at:string};
const KEY='sua-managed-content-v1', EVENT='sua-managed-content-changed';
const empty=():ManagedState=>({members:[],posts:[],videos:[]});
const text=(v:unknown,max:number,blank=false):v is string=>typeof v==='string'&&v.length<=max&&(blank||v.trim().length>0);
const date=(v:unknown):v is string=>text(v,50)&&Number.isFinite(Date.parse(v));
const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const member=(v:unknown):v is Member=>record(v)&&text(v.id,100)&&text(v.nickname,20)&&text(v.email,254,true)&&text(v.userType,30,true)&&text(v.knowledge,50,true)&&Array.isArray(v.goals)&&v.goals.length<=4&&v.goals.every(g=>text(g,80))&&['active','suspended','withdrawn'].some(s=>s===v.status)&&date(v.createdAt)&&date(v.updatedAt);
const content=(v:Record<string,unknown>)=>text(v.id,100)&&text(v.title,80)&&text(v.body,2000,true)&&text(v.author,20)&&text(v.ownerId,100)&&date(v.createdAt)&&['published','hidden'].some(s=>s===v.status);
const post=(v:unknown):v is ManagedPost=>record(v)&&content(v)&&text(v.body,2000)&&text(v.category,30)&&date(v.updatedAt);
const video=(v:unknown):v is ManagedVideo=>record(v)&&content(v)&&(v.wordId===null||text(v.wordId,100))&&typeof v.direction==='boolean'&&text(v.dialect,30);
export function decodeManagedState(raw:string|null):ManagedState{
 if(!raw)return empty();try{const v:unknown=JSON.parse(raw);if(!record(v)||v.version!==1||!Array.isArray(v.members)||!Array.isArray(v.posts)||!Array.isArray(v.videos)||[v.members,v.posts,v.videos].some(a=>a.length>500))return empty();
 const unique=<T extends {id:string}>(a:T[])=>a.filter((v,i)=>a.findIndex(x=>x.id===v.id)===i);
 return {members:unique(v.members.filter(member)),posts:unique(v.posts.filter(post)),videos:unique(v.videos.filter(video))};}catch{return empty()}
}
export function memberCanPublish(state:ManagedState,actor:string){const m=state.members.find(m=>m.id===actor);return !m||m.status==='active'}
export function contentIsVisible(state:ManagedState,item:ManagedPost|ManagedVideo){return item.status==='published'&&memberCanPublish(state,item.ownerId)}
export function managedReducer(state:ManagedState,action:ManagedAction):ManagedState{
 if(action.type==='member'){
  if(!member(action.member))return state;const prior=state.members.find(m=>m.id===action.member.id);
  if(prior&&prior.status!=='active')return state;if(!prior&&state.members.length>=500)return state;
  const next={...action.member,status:prior?.status||'active' as const,createdAt:prior?.createdAt||action.member.createdAt};
  return {...state,members:prior?state.members.map(m=>m.id===next.id?next:m):[next,...state.members]};
 }
 if(action.type==='moderateMember'){
  const prior=state.members.find(m=>m.id===action.id);if(!prior||prior.status==='withdrawn')return state;
  const status=action.action==='suspend'?'suspended':'active';if(prior.status===status)return state;
  return {...state,members:state.members.map(m=>m.id===prior.id?{...m,status}:m)};
 }
 if(action.type==='post'){
  const p=action.post,prior=state.posts.find(p=>p.id===action.post.id);
  if(!post(p)||!memberCanPublish(state,action.actor)||p.ownerId!==action.actor||p.status!=='published'||(prior&&(prior.ownerId!==action.actor||prior.status==='hidden'))||(!prior&&state.posts.length>=500))return state;
  const next={...p,createdAt:prior?.createdAt||p.createdAt};return {...state,posts:prior?state.posts.map(p=>p.id===next.id?next:p):[next,...state.posts]};
 }
 if(action.type==='video'){
  const v=action.video;if(!video(v)||!memberCanPublish(state,action.actor)||v.ownerId!==action.actor||v.status!=='published'||state.videos.some(x=>x.id===v.id)||state.videos.length>=500)return state;
  return {...state,videos:[v,...state.videos]};
 }
 if(action.type==='moderateContent'){
  const key=action.kind==='post'?'posts':'videos',status=action.action==='hide'?'hidden':'published';
  if(!state[key].some(item=>item.id===action.id&&item.status!==status))return state;
  return {...state,[key]:state[key].map(item=>item.id===action.id?{...item,status}:item)};
 }
 if(action.type==='remove'){
  const key=action.kind==='post'?'posts':'videos';if(!state[key].some(item=>item.id===action.id&&item.ownerId===action.actor))return state;
  return {...state,[key]:state[key].filter(item=>item.id!==action.id)};
 }
 if(action.type==='withdraw'){
  if(!text(action.actor,100)||!date(action.at))return state;
  const affected=state.members.some(m=>m.id===action.actor&&m.status!=='withdrawn')||state.posts.some(p=>p.ownerId===action.actor)||state.videos.some(v=>v.ownerId===action.actor);if(!affected)return state;
  return {members:state.members.map(m=>m.id===action.actor?{...m,nickname:'탈퇴한 회원',email:'',userType:'',knowledge:'',goals:[],status:'withdrawn',updatedAt:action.at}:m),posts:state.posts.filter(p=>p.ownerId!==action.actor),videos:state.videos.filter(v=>v.ownerId!==action.actor)};
 }
 return state;
}
let cachedRaw:string|null|undefined,cached=empty();
export function getManagedSnapshot(){let raw:string|null;try{raw=localStorage.getItem(KEY)}catch{return cached}if(raw!==cachedRaw){cachedRaw=raw;cached=decodeManagedState(raw)}return cached}
export function subscribeManagedContent(notify:()=>void){const storage=(e:StorageEvent)=>{if(e.key===KEY||e.key===null)notify()};window.addEventListener('storage',storage);window.addEventListener(EVENT,notify);return()=>{window.removeEventListener('storage',storage);window.removeEventListener(EVENT,notify)}}
function commit(action:ManagedAction){try{const raw=localStorage.getItem(KEY),previous=decodeManagedState(raw),next=managedReducer(previous,action);if(next===previous)return false;localStorage.setItem(KEY,JSON.stringify({version:1,...next}));cachedRaw=undefined;window.dispatchEvent(new Event(EVENT));return true}catch{return false}}
export function saveLocalMember(input:Pick<Member,'nickname'|'email'|'userType'|'knowledge'|'goals'>){const now=new Date().toISOString();return commit({type:'member',member:{...input,id:getLocalActorId(),status:'active',createdAt:now,updatedAt:now}})}
export function ensureLocalMember(nickname:string){const m=getManagedSnapshot().members.find(m=>m.id===getLocalActorId());return m?m.status==='active':saveLocalMember({nickname,email:'',userType:'',knowledge:'',goals:[]})}
export function saveManagedPost(input:Pick<ManagedPost,'title'|'body'|'category'|'author'>&{id?:string}){if(!ensureLocalMember(input.author))return null;const now=new Date().toISOString(),p:ManagedPost={...input,id:input.id||crypto.randomUUID(),ownerId:getLocalActorId(),createdAt:now,updatedAt:now,status:'published'};return commit({type:'post',post:p,actor:getLocalActorId()})?p:null}
export function removeManagedPost(id:string){return commit({type:'remove',kind:'post',id,actor:getLocalActorId()})}
// These actions operate only on browser-local records. They do not implement server authorization.
export function moderateMember(id:string,action:'suspend'|'restore'){return commit({type:'moderateMember',id,action})}
export function moderateContent(kind:'post'|'video',id:string,action:'hide'|'restore'){return commit({type:'moderateContent',kind,id,action})}
export function beginNewLocalMembership(){const prior=getManagedSnapshot().members.find(m=>m.id===getLocalActorId());return prior?.status==='withdrawn'?renewLocalActorId():true}

function openMediaDB():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const r=indexedDB.open('sua-local-media',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('videos'))r.result.createObjectStore('videos')};r.onerror=()=>reject(r.error);r.onblocked=()=>reject(new Error('다른 탭의 영상 저장소를 확인해 주세요.'));r.onsuccess=()=>{r.result.onversionchange=()=>r.result.close();resolve(r.result)}})}
async function mediaWrite(id:string,blob:Blob|null){const db=await openMediaDB();try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction('videos','readwrite'),store=tx.objectStore('videos');if(blob)store.put(blob,id);else store.delete(id);tx.oncomplete=()=>resolve();tx.onabort=()=>reject(tx.error);tx.onerror=()=>reject(tx.error)})}finally{db.close()}}
export async function getVideoBlob(id:string):Promise<Blob|null>{const db=await openMediaDB();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('videos','readonly'),r=tx.objectStore('videos').get(id);r.onsuccess=()=>resolve(r.result instanceof Blob?r.result:null);r.onerror=()=>reject(r.error)})}finally{db.close()}}
export async function addManagedVideo(input:Omit<ManagedVideo,'id'|'ownerId'|'createdAt'|'status'>,blob:Blob){if(!blob.type.startsWith('video/')||!blob.size||blob.size>35*1024*1024||!ensureLocalMember(input.author))return null;const v:ManagedVideo={...input,id:crypto.randomUUID(),ownerId:getLocalActorId(),createdAt:new Date().toISOString(),status:'published'};if(!video(v))return null;
 try{await mediaWrite(v.id,blob);if(commit({type:'video',video:v,actor:getLocalActorId()}))return v;await mediaWrite(v.id,null);return null}catch{return null}}
export async function removeManagedVideo(id:string){const v=getManagedSnapshot().videos.find(v=>v.id===id&&v.ownerId===getLocalActorId());if(!v)return false;
 // Delete metadata only after the binary store confirms deletion; on metadata failure restore the binary.
 try{const blob=await getVideoBlob(id);await mediaWrite(id,null);if(commit({type:'remove',kind:'video',id,actor:getLocalActorId()}))return true;if(blob)await mediaWrite(id,blob);return false}catch{return false}}
export async function withdrawManagedData(){
 try{localStorage.getItem(KEY)}catch{return false}const actor=getLocalActorId(),state=getManagedSnapshot(),owned=state.videos.filter(v=>v.ownerId===actor),backup=new Map<string,Blob>();
 let questionCleanup:ReturnType<typeof prepareMyQuestionCleanup>=null;
 try{for(const v of owned){const b=await getVideoBlob(v.id);if(b)backup.set(v.id,b)}for(const v of owned)await mediaWrite(v.id,null);
 const current=getManagedSnapshot(),latest=current.videos.filter(v=>v.ownerId===actor);if(latest.length!==owned.length||latest.some(v=>!owned.some(item=>item.id===v.id)))throw new Error('영상 목록이 변경되었습니다.');
 questionCleanup=prepareMyQuestionCleanup();if(!questionCleanup||!questionCleanup.apply())throw new Error('질문 기록을 정리하지 못했습니다.');
 const affected=current.members.some(m=>m.id===actor&&m.status!=='withdrawn')||current.posts.some(p=>p.ownerId===actor)||owned.length;
 if(!affected||commit({type:'withdraw',actor,at:new Date().toISOString()}))return true;
 }catch{/* Keep metadata visible and restore any removed binary before reporting failure. */}
 questionCleanup?.rollback();
 try{for(const [id,blob]of backup)await mediaWrite(id,blob)}catch{/* Browser storage is unavailable; the caller must keep the failure state. */}return false;
}
