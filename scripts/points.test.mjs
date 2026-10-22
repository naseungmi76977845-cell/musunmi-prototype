import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getBalance,initialPoints,pointsReducer,decorations,rewardRules} from '../src/points.ts';

const at='2026-10-22T00:00:00.000Z';
const earn=(state,reward)=>pointsReducer(state,{type:'earn',reward,at});
const buy=(state,itemId)=>pointsReducer(state,{type:'redeem',itemId,at});

test('starts with zero points and only free equipped items',()=>{
  const state=initialPoints();
  assert.equal(getBalance(state),0);
  assert.deepEqual(state.owned,Object.values(state.equipped));
  assert.notEqual(initialPoints().owned,state.owned);
});
test('each earning event is paid once, even when repeated or retried',()=>{
  let state=initialPoints();
  for(const reward of rewardRules){state=earn(state,reward.key);state=earn(state,reward.key)}
  assert.equal(getBalance(state),130);
  assert.equal(state.transactions.length,4);
  assert.equal(new Set(state.transactions.map(item=>item.id)).size,4);
});
test('insufficient points cannot buy or equip an item',()=>{
  const state=earn(initialPoints(),'bookmark');
  assert.equal(buy(state,'frame-ring'),state);
  assert.equal(getBalance(state),20);
  assert.equal(state.equipped.frame,'frame-default');
});
test('purchase spends exactly once and previously owned items can be reapplied for free',()=>{
  const earned=earn(initialPoints(),'bookmark');
  const purchased=buy(earned,'tone-sky');
  assert.equal(getBalance(purchased),0);
  assert.equal(purchased.equipped.tone,'tone-sky');
  assert.equal(purchased.transactions.length,2);
  assert.equal(buy(purchased,'tone-sky'),purchased);
  const resetTone=buy(purchased,'tone-default');
  const reapplied=buy(resetTone,'tone-sky');
  assert.equal(getBalance(reapplied),0);
  assert.equal(reapplied.equipped.tone,'tone-sky');
  assert.equal(reapplied.transactions.length,2);
  assert.equal(earned.equipped.tone,'tone-default');
});
test('sequential competing purchases never overdraft the ledger',()=>{
  let state=earn(initialPoints(),'profile');
  state=buy(state,'tone-sky');
  const after=buy(state,'tone-peach');
  assert.equal(after,state);
  assert.equal(getBalance(after),10);
  assert(!after.owned.includes('tone-peach'));
});
test('invalid IDs cannot change points or ownership',()=>{
  const state=initialPoints();
  assert.equal(buy(state,'not-an-item'),state);
  assert.equal(earn(state,'not-a-reward'),state);
});
test('reset clears points, history, ownership and decoration together',()=>{
  const state=buy(earn(initialPoints(),'recording'),'badge-star');
  const reset=pointsReducer(state,{type:'reset'});
  assert.deepEqual(reset,initialPoints());
  assert.equal(getBalance(reset),0);
});
test('all reachable purchases preserve balance, unique ownership and valid equipped items',()=>{
  let state=rewardRules.reduce((current,item)=>earn(current,item.key),initialPoints());
  for(const item of [...decorations,...decorations].reverse()){
    state=buy(state,item.id);
    assert(getBalance(state)>=0);
    assert.equal(new Set(state.owned).size,state.owned.length);
    for(const [kind,id] of Object.entries(state.equipped)){
      assert(state.owned.includes(id));
      assert.equal(decorations.find(item=>item.id===id)?.kind,kind);
    }
  }
});
