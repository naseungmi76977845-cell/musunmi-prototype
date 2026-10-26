/** Local daily boarding pass for the 배움역 line. One ticket regenerates each calendar day. */

export type LearnTicketState = {
  /** YYYY-MM-DD of the day the daily ticket was spent, or null if unused today. */
  usedOn: string | null;
  /** Station ids that were unlocked with a ticket and can be revisited without spending again. */
  unlocked: string[];
};

export const LEARN_TICKET_KEY = 'sueoyeok-learn-ticket-v1';
export const TICKET_GATED_STATIONS = ['thanks'] as const;
export type TicketGatedStation = (typeof TICKET_GATED_STATIONS)[number];

export function todayKey(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function initialLearnTicket(): LearnTicketState {
  return {usedOn: null, unlocked: []};
}

export function isTicketGated(id: string): id is TicketGatedStation {
  return (TICKET_GATED_STATIONS as readonly string[]).includes(id);
}

export function hasDailyTicket(state: LearnTicketState, today = todayKey()) {
  return state.usedOn !== today;
}

export function isStationUnlocked(state: LearnTicketState, id: string) {
  return state.unlocked.includes(id);
}

/** Whether opening this station needs the ticket confirmation UI. */
export function needsTicketGate(state: LearnTicketState, id: string, today = todayKey()) {
  if (!isTicketGated(id)) return false;
  if (isStationUnlocked(state, id)) return false;
  return true;
}

export function canSpendTicket(state: LearnTicketState, id: string, today = todayKey()) {
  return needsTicketGate(state, id, today) && hasDailyTicket(state, today);
}

export function spendTicket(state: LearnTicketState, id: string, today = todayKey()): LearnTicketState | null {
  if (!canSpendTicket(state, id, today)) return null;
  return {
    usedOn: today,
    unlocked: state.unlocked.includes(id) ? state.unlocked : [...state.unlocked, id],
  };
}

export function decodeLearnTicket(raw: string | null): LearnTicketState {
  if (!raw) return initialLearnTicket();
  try {
    const value = JSON.parse(raw) as Partial<LearnTicketState>;
    if (!value || typeof value !== 'object') return initialLearnTicket();
    const usedOn = typeof value.usedOn === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.usedOn) ? value.usedOn : null;
    const unlocked = Array.isArray(value.unlocked)
      ? value.unlocked.filter((id): id is string => typeof id === 'string' && id.length > 0 && id.length <= 40).slice(0, 40)
      : [];
    return {usedOn, unlocked: [...new Set(unlocked)]};
  } catch {
    return initialLearnTicket();
  }
}

export function loadLearnTicket(): LearnTicketState {
  try {
    return decodeLearnTicket(localStorage.getItem(LEARN_TICKET_KEY));
  } catch {
    return initialLearnTicket();
  }
}

export function saveLearnTicket(state: LearnTicketState) {
  try {
    localStorage.setItem(LEARN_TICKET_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
