import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  canSpendTicket,
  decodeLearnTicket,
  hasDailyTicket,
  initialLearnTicket,
  isTicketGated,
  needsTicketGate,
  spendTicket,
} from '../src/learn-ticket.ts';

test('only thanks is gated on the daily line', () => {
  assert.equal(isTicketGated('hello'), false);
  assert.equal(isTicketGated('thanks'), true);
  assert.equal(needsTicketGate(initialLearnTicket(), 'hello'), false);
  assert.equal(needsTicketGate(initialLearnTicket(), 'thanks'), true);
});

test('spending unlocks the station and consumes today\'s ticket once', () => {
  const today = '2026-10-26';
  const spent = spendTicket(initialLearnTicket(), 'thanks', today);
  assert.ok(spent);
  assert.equal(spent.usedOn, today);
  assert.deepEqual(spent.unlocked, ['thanks']);
  assert.equal(hasDailyTicket(spent, today), false);
  assert.equal(canSpendTicket(spent, 'thanks', today), false);
  assert.equal(needsTicketGate(spent, 'thanks', today), false);
  assert.equal(spendTicket(spent, 'thanks', today), null);
});

test('a new calendar day restores the daily ticket', () => {
  const spent = spendTicket(initialLearnTicket(), 'thanks', '2026-10-26');
  assert.ok(spent);
  assert.equal(hasDailyTicket(spent, '2026-10-27'), true);
  assert.equal(needsTicketGate(spent, 'thanks', '2026-10-27'), false);
});

test('invalid storage falls back to an empty ticket ledger', () => {
  assert.deepEqual(decodeLearnTicket(null), initialLearnTicket());
  assert.deepEqual(decodeLearnTicket('{'), initialLearnTicket());
  assert.deepEqual(decodeLearnTicket('{"usedOn":"nope","unlocked":["thanks",1]}'), {usedOn: null, unlocked: ['thanks']});
});
