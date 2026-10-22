import {test} from 'node:test';
import assert from 'node:assert/strict';
import {notificationReducer,addUserVideo,removeUserVideo} from '../src/activity.ts';
const createdAt='2026-10-22T01:00:00.000Z';
const notice=(id,target)=>({id,kind:target.type==='post'?'community':target.type==='video'?'video':'points',title:'소식',body:'내용',createdAt,read:false,target});
const video=id=>({id,wordId:'hello',title:'안녕하세요',body:'설명',url:`blob:${id}`,direction:false,dialect:'잘 모르겠어요',createdAt});
test('each upload remains independently addressable, including the same expression',()=>{
  const first=addUserVideo([],video('first'));
  const both=addUserVideo(first,video('second'));
  assert.deepEqual(both.map(item=>item.id),['second','first']);
  assert.equal(first.length,1);
  assert.equal(addUserVideo(both,video('first')),both);
  assert.deepEqual(removeUserVideo(both,'first').map(item=>item.id),['second']);
  assert.equal(both.length,2);
});
test('new notifications are deduplicated by event ID and newest first',()=>{
  const first=notificationReducer([],{type:'add',item:notice('reward:recording',{type:'points'})});
  const both=notificationReducer(first,{type:'add',item:notice('video:one',{type:'video',id:'one'})});
  assert.equal(notificationReducer(both,{type:'add',item:notice('reward:recording',{type:'points'})}),both);
  assert.deepEqual(both.map(item=>item.id),['video:one','reward:recording']);
});
test('reading one item preserves others, and read-all clears unread count',()=>{
  const items=[notice('one',{type:'post',id:'post'}),notice('two',{type:'video',id:'video'})];
  const read=notificationReducer(items,{type:'read',id:'one'});
  assert.deepEqual(read.map(item=>item.read),[true,false]);
  assert.deepEqual(items.map(item=>item.read),[false,false]);
  assert.equal(notificationReducer(read,{type:'readAll'}).filter(item=>!item.read).length,0);
});
test('deleting a target removes only its alerts, preserving points and other content',()=>{
  const items=[notice('post',{type:'post',id:'same'}),notice('video',{type:'video',id:'same'}),notice('other-video',{type:'video',id:'other'}),notice('reward',{type:'points'})];
  const remaining=notificationReducer(items,{type:'removeTarget',target:{type:'video',id:'same'}});
  assert.deepEqual(remaining.map(item=>item.id),['post','other-video','reward']);
});
test('reset removes alerts and unread state',()=>{
  assert.deepEqual(notificationReducer([notice('one',{type:'post',id:'post'})],{type:'reset'}),[]);
});
