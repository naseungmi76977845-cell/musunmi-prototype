import {test} from 'node:test';
import assert from 'node:assert/strict';
import {questionsReducer,decodeQuestionStore,getLocalActorId,clearMyQuestionData} from '../src/questions.ts';
const at='2026-10-22T00:00:00.000Z';
const question=(id,ownerId='a')=>({id,ownerId,term:'차돌짬뽕',body:'음식 이름이 궁금해요',author:'초록별',createdAt:at,status:'open',answers:[],reports:[]});
const answer=(id,ownerId='b')=>({id,ownerId,body:'제가 쓰는 표현을 나누고 싶어요.',author:'이웃',createdAt:at});

test('valid questions are independent; invalid or duplicate submissions do not alter state',()=>{
 const one=questionsReducer([],{type:'create',question:question('one')});
 const two=questionsReducer(one,{type:'create',question:question('two')});
 assert.deepEqual(two.map(q=>q.id),['two','one']);
 assert.equal(questionsReducer(two,{type:'create',question:question('one')}),two);
 assert.equal(questionsReducer(two,{type:'create',question:{...question('blank'),term:'   '}}),two);
 assert.equal(questionsReducer(two,{type:'create',question:{...question('long'),term:'가'.repeat(41)}}),two);
});
test('answers update only their question and a hidden question cannot receive replies',()=>{
 const state=[question('one'),question('two')];
 const replied=questionsReducer(state,{type:'answer',id:'one',answer:answer('reply')});
 assert.equal(replied[0].status,'answered');assert.equal(replied[1],state[1]);
 assert.equal(questionsReducer(replied,{type:'answer',id:'one',answer:answer('reply')}),replied);
 const hidden=questionsReducer(replied,{type:'moderate',id:'one',action:'hide'});
 assert.equal(questionsReducer(hidden,{type:'answer',id:'one',answer:answer('new')}),hidden);
 const restored=questionsReducer(hidden,{type:'moderate',id:'one',action:'restore'});
 assert.equal(restored[0].status,'answered');assert.equal(restored[0].answers.length,1);
});
test('one report per actor; handling one target leaves other questions unchanged',()=>{
 const state=[question('one'),question('two')],report={by:'b',reason:'스팸',createdAt:at};
 const flagged=questionsReducer(state,{type:'report',id:'one',report});
 assert.equal(questionsReducer(flagged,{type:'report',id:'one',report}),flagged);
 assert.equal(questionsReducer(flagged,{type:'report',id:'one',report:{...report,reason:'unknown'}}),flagged);
 const handled=questionsReducer(flagged,{type:'moderate',id:'one',action:'dismissReports'});
 assert.equal(handled[0].reports.length,0);assert.equal(handled[1],state[1]);
});
test('account cleanup removes own questions and replies while preserving other authors',()=>{
 const state=[question('own','a'),{...question('other','b'),status:'answered',answers:[answer('mine','a'),answer('theirs','c')]}];
 const clean=questionsReducer(state,{type:'clearMine',actorId:'a'});
 assert.equal(clean.length,1);assert.deepEqual(clean[0].answers.map(a=>a.id),['theirs']);
 assert.deepEqual(questionsReducer(clean,{type:'reset'}),[]);
});
test('storage corruption and invalid dates are safe; hidden state survives refresh',()=>{
 assert.deepEqual(decodeQuestionStore('{broken'),[]);assert.deepEqual(decodeQuestionStore(JSON.stringify({version:2,questions:[]})),[]);
 const raw=JSON.stringify({version:1,questions:[question('one'),{...question('bad'),createdAt:'invalid'},{...question('hidden'),status:'hidden'}]});
 assert.deepEqual(decodeQuestionStore(raw).map(q=>[q.id,q.status]),[['one','open'],['hidden','hidden']]);
 assert.deepEqual(decodeQuestionStore(JSON.stringify({version:1,questions:[{...question('coerced'),status:['hidden']}]})),[]);
});

test('account cleanup reports storage failures and never removes other authors',()=>{
 const oldStorage=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),oldWindow=Object.getOwnPropertyDescriptor(globalThis,'window');
 const memory=new Map();let failWrite=false,failRead=false;
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:key=>{if(failRead)throw Error('blocked');return memory.get(key)??null},setItem:(key,value)=>{if(failWrite)throw Error('quota');memory.set(key,value)}}});
 Object.defineProperty(globalThis,'window',{configurable:true,value:new EventTarget()});
 try{
  const actor=getLocalActorId();memory.set('sua-questions-v1',JSON.stringify({version:1,questions:[question('mine',actor),question('theirs','other')]}));
  failWrite=true;assert.equal(clearMyQuestionData(),false);assert.equal(decodeQuestionStore(memory.get('sua-questions-v1')).length,2);
  failWrite=false;assert.equal(clearMyQuestionData(),true);assert.deepEqual(decodeQuestionStore(memory.get('sua-questions-v1')).map(q=>q.id),['theirs']);
  assert.equal(clearMyQuestionData(),true);
  failRead=true;assert.equal(clearMyQuestionData(),false);
 }finally{if(oldStorage)Object.defineProperty(globalThis,'localStorage',oldStorage);else delete globalThis.localStorage;if(oldWindow)Object.defineProperty(globalThis,'window',oldWindow);else delete globalThis.window}
});
