import {test} from 'node:test';
import assert from 'node:assert/strict';
import {managedReducer,decodeManagedState,contentIsVisible,saveLocalMember,moderateMember,saveManagedPost,getManagedSnapshot,withdrawManagedData,beginNewLocalMembership} from '../src/managed-content.ts';
import {getLocalActorId} from '../src/questions.ts';
const at='2026-10-22T00:00:00.000Z';
const member=(id,status='active')=>({id,nickname:'초록별',email:'',userType:'deaf',knowledge:'new',goals:[],status,createdAt:at,updatedAt:at});
const post=(id,ownerId='a')=>({id,ownerId,title:'수어 나누기',body:'안녕하세요.',category:'표현 나눔',author:'초록별',createdAt:at,updatedAt:at,status:'published'});
const video=(id,ownerId='a')=>({id,ownerId,title:'감사합니다',body:'',wordId:'thanks',author:'초록별',direction:false,dialect:'아니요',createdAt:at,status:'published'});
const base=()=>({members:[member('a'),member('b')],posts:[post('one'),post('two','b')],videos:[video('one'),video('two','b')]});
test('suspension blocks contribution and hides owned content; restore preserves content moderation',()=>{
 const initial=base(),hidden=managedReducer(initial,{type:'moderateContent',kind:'post',id:'one',action:'hide'});
 const suspended=managedReducer(hidden,{type:'moderateMember',id:'a',action:'suspend'});
 assert.equal(contentIsVisible(suspended,suspended.videos[0]),false);
 assert.equal(contentIsVisible(suspended,suspended.posts[1]),true);
 assert.equal(managedReducer(suspended,{type:'post',post:post('new'),actor:'a'}),suspended);
 assert.equal(managedReducer(suspended,{type:'video',video:video('new'),actor:'a'}),suspended);
 const restored=managedReducer(suspended,{type:'moderateMember',id:'a',action:'restore'});
 assert.equal(contentIsVisible(restored,restored.videos[0]),true);
 assert.equal(contentIsVisible(restored,restored.posts[0]),false);
});
test('profile saves cannot activate suspended or withdrawn members',()=>{
 for(const status of ['suspended','withdrawn']){const state={...base(),members:[member('a',status)]};assert.equal(managedReducer(state,{type:'member',member:member('a')}),state)}
 const state={...base(),members:[member('a','withdrawn')]};assert.equal(managedReducer(state,{type:'moderateMember',id:'a',action:'restore'}),state);
});
test('post edits cannot overwrite another owner or restore a hidden post',()=>{
 const state=base();assert.equal(managedReducer(state,{type:'post',post:{...post('two'),body:'changed'},actor:'a'}),state);
 const hidden=managedReducer(state,{type:'moderateContent',kind:'post',id:'one',action:'hide'});assert.equal(managedReducer(hidden,{type:'post',post:post('one'),actor:'a'}),hidden);
 const edited=managedReducer(state,{type:'post',post:{...post('one'),title:'수정',createdAt:'2026-10-23T00:00:00Z'},actor:'a'});assert.equal(edited.posts[0].createdAt,at);assert.equal(edited.posts[1],state.posts[1]);
});
test('moderation and removal affect only the matching kind and owner',()=>{
 const state=base(),hidden=managedReducer(state,{type:'moderateContent',kind:'video',id:'one',action:'hide'});
 assert.equal(hidden.posts,state.posts);assert.equal(hidden.videos[0].status,'hidden');assert.equal(hidden.videos[1],state.videos[1]);
 assert.equal(managedReducer(hidden,{type:'remove',kind:'video',id:'two',actor:'a'}),hidden);
 const restored=managedReducer(hidden,{type:'moderateContent',kind:'video',id:'one',action:'restore'});assert.equal(restored.videos[0].status,'published');
});
test('withdrawal scrubs personal fields and only removes own posts/videos',()=>{
 const state=base(),next=managedReducer(state,{type:'withdraw',actor:'a',at});
 assert.equal(next.members[0].status,'withdrawn');assert.equal(next.members[0].email,'');assert.deepEqual(next.members[0].goals,[]);
 assert.deepEqual(next.posts.map(p=>p.id),['two']);assert.deepEqual(next.videos.map(p=>p.id),['two']);assert.equal(next.members[1],state.members[1]);
});
test('corrupt and coerced statuses are rejected; hidden data persists without blob URLs',()=>{
 assert.deepEqual(decodeManagedState('{bad'),{members:[],posts:[],videos:[]});
 const state=base();state.posts[0].status=['hidden'];state.videos[0].status='hidden';state.members[0].createdAt='invalid';
 const decoded=decodeManagedState(JSON.stringify({version:1,...state}));assert.equal(decoded.members.length,1);assert.equal(decoded.posts.length,1);assert.equal(decoded.videos[0].status,'hidden');assert.equal('url' in decoded.videos[0],false);
});
test('browser storage write failures do not produce saved records or undo suspension',()=>{
 const memory=new Map();globalThis.window=new EventTarget();globalThis.localStorage={getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value)};
 const actor=getLocalActorId();assert.equal(saveLocalMember({nickname:'실제 회원',email:'',userType:'hearing',knowledge:'new',goals:[]}),true);
 assert.equal(moderateMember(actor,'suspend'),true);assert.equal(saveManagedPost({title:'차단',body:'본문',author:'실제 회원',category:'표현 나눔'}),null);
 assert.equal(moderateMember(actor,'restore'),true);const before=getManagedSnapshot().members[0].nickname;
 globalThis.localStorage.setItem=()=>{throw new Error('QuotaExceededError')};assert.equal(saveLocalMember({nickname:'저장 실패',email:'',userType:'other',knowledge:'',goals:[]}),false);assert.equal(getManagedSnapshot().members[0].nickname,before);
 assert.equal(saveManagedPost({title:'저장 실패',body:'본문',author:'실제 회원',category:'표현 나눔'}),null);assert.equal(getManagedSnapshot().posts.length,0);
});


test('withdrawal failure in media preparation preserves questions and membership',async()=>{
 const actor=getLocalActorId(),memory=new Map();globalThis.window=new EventTarget();globalThis.localStorage={getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value)};
 memory.set('sua-question-actor-v1',actor);memory.set('sua-managed-content-v1',JSON.stringify({version:1,members:[member(actor)],posts:[],videos:[video('file',actor)]}));
 const q={id:'q',ownerId:actor,term:'차돌짬뽕',body:'궁금해요',author:'초록별',createdAt:at,status:'open',answers:[],reports:[]};memory.set('sua-questions-v1',JSON.stringify({version:1,questions:[q]}));
 globalThis.indexedDB={open(){throw new Error('Unavailable')}};
 assert.equal(await withdrawManagedData(),false);assert.equal(JSON.parse(memory.get('sua-questions-v1')).questions.length,1);assert.equal(getManagedSnapshot().members[0].status,'active');
});
test('failed metadata commit rolls questions back; successful withdrawal permits a fresh identity',async()=>{
 const actor=getLocalActorId(),memory=new Map();globalThis.window=new EventTarget();let fail=true;
 globalThis.localStorage={getItem:key=>memory.get(key)??null,setItem:(key,value)=>{if(fail&&key==='sua-managed-content-v1')throw new Error('Storage write failed');memory.set(key,value)}};
 memory.set('sua-question-actor-v1',actor);memory.set('sua-managed-content-v1',JSON.stringify({version:1,members:[member(actor)],posts:[post('own',actor)],videos:[]}));
 const q={id:'q',ownerId:actor,term:'차돌짬뽕',body:'궁금해요',author:'초록별',createdAt:at,status:'open',answers:[],reports:[]};memory.set('sua-questions-v1',JSON.stringify({version:1,questions:[q]}));
 assert.equal(await withdrawManagedData(),false);assert.equal(JSON.parse(memory.get('sua-questions-v1')).questions.length,1);assert.equal(getManagedSnapshot().members[0].status,'active');
 fail=false;assert.equal(await withdrawManagedData(),true);assert.equal(JSON.parse(memory.get('sua-questions-v1')).questions.length,0);assert.equal(getManagedSnapshot().members[0].status,'withdrawn');
 assert.equal(beginNewLocalMembership(),true);assert.notEqual(getLocalActorId(),actor);assert.equal(saveLocalMember({nickname:'새 가입',email:'',userType:'other',knowledge:'',goals:[]}),true);assert.equal(getManagedSnapshot().members.length,2);assert.equal(getManagedSnapshot().members.find(m=>m.id===actor).status,'withdrawn');
 const fresh=getLocalActorId();assert.equal(moderateMember(fresh,'suspend'),true);assert.equal(beginNewLocalMembership(),true);assert.equal(getLocalActorId(),fresh);
});
