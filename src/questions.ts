export type Answer={id:string;body:string;author:string;ownerId:string;createdAt:string};
export type QuestionReport={by:string;reason:string;createdAt:string};
export type Question={id:string;term:string;body:string;author:string;ownerId:string;createdAt:string;status:'open'|'answered'|'hidden';answers:Answer[];reports:QuestionReport[]};
export const reportReasons=['스팸','부적절한 내용','잘못된 정보','기타'] as const;
export type QuestionAction=
 |{type:'create';question:Question}
 |{type:'answer';id:string;answer:Answer}
 |{type:'report';id:string;report:QuestionReport}
 |{type:'moderate';id:string;action:'hide'|'restore'|'dismissReports'}
 |{type:'clearMine';actorId:string}
 |{type:'reset'};

const STORE_KEY='sua-questions-v1';
const ACTOR_KEY='sua-question-actor-v1';
const CHANGE_EVENT='sua-questions-changed';
const validText=(v:unknown,max:number,empty=false):v is string=>typeof v==='string'&&v.length<=max&&(empty||v.trim().length>0);
const validDate=(v:unknown):v is string=>typeof v==='string'&&Number.isFinite(Date.parse(v));
const isRecord=(v:unknown):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v);
function validAnswer(v:unknown):v is Answer{return isRecord(v)&&validText(v.id,100)&&validText(v.body,1000)&&validText(v.author,20)&&validText(v.ownerId,100)&&validDate(v.createdAt)}
function validReport(v:unknown):v is QuestionReport{return isRecord(v)&&validText(v.by,100)&&typeof v.reason==='string'&&reportReasons.some(r=>r===v.reason)&&validDate(v.createdAt)}
function validQuestion(v:unknown):v is Question{return isRecord(v)&&validText(v.id,100)&&validText(v.term,40)&&validText(v.body,1000,true)&&validText(v.author,20)&&validText(v.ownerId,100)&&validDate(v.createdAt)&&typeof v.status==='string'&&['open','answered','hidden'].includes(v.status)&&Array.isArray(v.answers)&&v.answers.length<=100&&v.answers.every(validAnswer)&&new Set(v.answers.map(a=>a.id)).size===v.answers.length&&Array.isArray(v.reports)&&v.reports.length<=100&&v.reports.every(validReport)&&new Set(v.reports.map(r=>r.by)).size===v.reports.length}
const visibleStatus=(answers:Answer[]):Question['status']=>answers.length?'answered':'open';

export function decodeQuestionStore(raw:string|null):Question[]{
 if(!raw)return [];
 try{const parsed:unknown=JSON.parse(raw);if(!isRecord(parsed)||parsed.version!==1||!Array.isArray(parsed.questions)||parsed.questions.length>100)return [];
 const seen=new Set<string>();return parsed.questions.filter(validQuestion).filter(q=>{if(seen.has(q.id))return false;seen.add(q.id);return true}).map(q=>({...q,status:q.status==='hidden'?'hidden':visibleStatus(q.answers)}));
 }catch{return []}
}

export function questionsReducer(state:Question[],action:QuestionAction):Question[]{
 if(action.type==='reset')return state.length?[]:state;
 if(action.type==='create'){
  const q=action.question;if(!validQuestion(q)||state.length>=100||state.some(item=>item.id===q.id)||q.status!=='open'||q.answers.length||q.reports.length)return state;
  return [{...q,term:q.term.trim(),body:q.body.trim(),author:q.author.trim()},...state];
 }
 if(action.type==='clearMine'){
  if(!validText(action.actorId,100))return state;
  let changed=false;const next=state.filter(q=>{if(q.ownerId===action.actorId){changed=true;return false}return true}).map(q=>{
   const answers=q.answers.filter(a=>a.ownerId!==action.actorId),reports=q.reports.filter(r=>r.by!==action.actorId);
   if(answers.length===q.answers.length&&reports.length===q.reports.length)return q;
   changed=true;return {...q,answers,reports,status:q.status==='hidden'?'hidden' as const:visibleStatus(answers)};
  });return changed?next:state;
 }
 let changed=false;const next=state.map(q=>{
  if(q.id!==action.id)return q;
  if(action.type==='answer'){
   if(q.status==='hidden'||!validAnswer(action.answer)||q.answers.length>=100||q.answers.some(a=>a.id===action.answer.id))return q;
   changed=true;return {...q,status:'answered' as const,answers:[...q.answers,{...action.answer,body:action.answer.body.trim(),author:action.answer.author.trim()}]};
  }
  if(action.type==='report'){
   if(q.status==='hidden'||!validReport(action.report)||q.reports.length>=100||q.reports.some(r=>r.by===action.report.by))return q;
   changed=true;return {...q,reports:[...q.reports,action.report]};
  }
  if(action.type==='moderate'){
   if(action.action==='hide'){if(q.status==='hidden'&&!q.reports.length)return q;changed=true;return {...q,status:'hidden' as const,reports:[]}}
   if(action.action==='restore'){if(q.status!=='hidden')return q;changed=true;return {...q,status:visibleStatus(q.answers)}}
   if(action.action==='dismissReports'){if(!q.reports.length)return q;changed=true;return {...q,reports:[]}}
  }
  return q;
 });return changed?next:state;
}

let cachedRaw:string|null|undefined;
let cached:Question[]=[];
let actorId:string|undefined;
export function getLocalActorId(){
 try{const stored=localStorage.getItem(ACTOR_KEY);if(validText(stored,100)){actorId=stored;return actorId}}catch{/* Browser storage may be unavailable. */}
 if(actorId)return actorId;
 actorId=crypto.randomUUID();try{localStorage.setItem(ACTOR_KEY,actorId)}catch{/* Keep one identity for this page session. */}return actorId;
}
export function renewLocalActorId(){const next=crypto.randomUUID();try{localStorage.setItem(ACTOR_KEY,next);actorId=next;return true}catch{return false}}
export function getQuestionSnapshot():Question[]{
 let raw:string|null=null;try{raw=localStorage.getItem(STORE_KEY)}catch{return cached}
 if(raw!==cachedRaw){cachedRaw=raw;cached=decodeQuestionStore(raw)}return cached;
}
export function subscribeQuestions(notify:()=>void){
 const storage=(event:StorageEvent)=>{if(event.key===STORE_KEY||event.key===null)notify()};
 window.addEventListener('storage',storage);window.addEventListener(CHANGE_EVENT,notify);
 return()=>{window.removeEventListener('storage',storage);window.removeEventListener(CHANGE_EVENT,notify)};
}
function commit(action:QuestionAction):boolean{
 const previous=getQuestionSnapshot(),next=questionsReducer(previous,action);if(next===previous)return false;
 try{localStorage.setItem(STORE_KEY,JSON.stringify({version:1,questions:next}));cachedRaw=undefined;window.dispatchEvent(new Event(CHANGE_EVENT));return true}catch{return false}
}
export function addQuestion({term,body,author}:{term:string;body:string;author:string}):Question|null{
 const question:Question={id:crypto.randomUUID(),term:term.trim(),body:body.trim(),author:author.trim()||'이웃',ownerId:getLocalActorId(),createdAt:new Date().toISOString(),status:'open',answers:[],reports:[]};
 return commit({type:'create',question})?question:null;
}
export function answerQuestion(id:string,body:string,author:string){return commit({type:'answer',id,answer:{id:crypto.randomUUID(),body:body.trim(),author:author.trim()||'이웃',ownerId:getLocalActorId(),createdAt:new Date().toISOString()}})}
export function reportQuestion(id:string,reason:string){return commit({type:'report',id,report:{by:getLocalActorId(),reason,createdAt:new Date().toISOString()}})}
// Prototype moderation changes this browser's local records; it is not an authorization boundary.
export function moderateQuestion(id:string,action:'hide'|'restore'|'dismissReports'){return commit({type:'moderate',id,action})}
export function clearMyQuestionData(){try{localStorage.getItem(STORE_KEY)}catch{return false}const actor=getLocalActorId();if(!getQuestionSnapshot().some(q=>q.ownerId===actor||q.answers.some(a=>a.ownerId===actor)||q.reports.some(r=>r.by===actor)))return true;return commit({type:'clearMine',actorId:actor})}
// Used only for an account withdrawal: both metadata stores commit synchronously after media preparation.
export function prepareMyQuestionCleanup(){
 let previousRaw:string|null;try{previousRaw=localStorage.getItem(STORE_KEY)}catch{return null}
 const previous=decodeQuestionStore(previousRaw),next=questionsReducer(previous,{type:'clearMine',actorId:getLocalActorId()});let applied=false;
 const publish=()=>{cachedRaw=undefined;window.dispatchEvent(new Event(CHANGE_EVENT))};
 return {apply(){if(next===previous)return true;try{localStorage.setItem(STORE_KEY,JSON.stringify({version:1,questions:next}));applied=true;publish();return true}catch{return false}},rollback(){if(!applied)return true;try{localStorage.setItem(STORE_KEY,previousRaw||JSON.stringify({version:1,questions:[]}));publish();return true}catch{return false}}};
}
export function resetQuestions(){return commit({type:'reset'})}
