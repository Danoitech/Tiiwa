import { addDays, atLocal, dateKey, startOfDay, TIME_PERIOD_HOURS, TIME_PERIODS, type TimePeriod } from '@/lib/dates';
import { clearEventsForBaby, getMeta, insertEvent, insertNappies, setMeta, upsertBaby } from './queries';
import type { FeedMethod, NappyColour, NappyType, TimePrecision } from './types';

export const DEMO_SEED_VERSION = 'tiwatayo-1';
export const DEMO_BABY_NAME = 'Tiwatayo';
export const DEMO_BABY_DOB = '2026-03-12';

const COLOURS: NappyColour[] = ['normal', 'light_brown', 'dark_brown', 'green', 'yellow', 'other'];
const NAPPY_TYPES: NappyType[] = ['wet', 'dirty', 'both'];

function dayKey(offset: number) {
  return dateKey(addDays(startOfDay(new Date()), offset));
}

function minutesBetween(start: string, end: string) {
  const [sd, st = '00:00:00'] = start.split('T');
  const [ed, et = '00:00:00'] = end.split('T');
  const [sh, sm] = st.split(':').map(Number);
  const [eh, em] = et.split(':').map(Number);
  const [sy, smo, sday] = sd.split('-').map(Number);
  const [ey, emo, eday] = ed.split('-').map(Number);
  const startMs = new Date(sy, smo - 1, sday, sh, sm).getTime();
  const endMs = new Date(ey, emo - 1, eday, eh, em).getTime();
  return Math.max(0, Math.round((endMs - startMs) / 60000));
}

async function logFeed(
  babyId: number,
  date: string,
  hour: number,
  minute: number,
  method: FeedMethod,
  minutes: number,
  extras?: { precision?: TimePrecision; period?: TimePeriod; notes?: string }
) {
  const precision = extras?.precision ?? 'exact';
  const period = extras?.period;
  const occurredAt = precision === 'period' && period
    ? atLocal(date, TIME_PERIOD_HOURS[period], 0)
    : atLocal(date, hour, minute);
  await insertEvent({
    babyId,
    kind: 'feed',
    occurredAt,
    timePrecision: precision,
    timePeriod: period ?? null,
    payload: { method, minutes },
    notes: extras?.notes ?? null,
  });
}

async function logSleep(
  babyId: number,
  date: string,
  startH: number,
  startM: number,
  endH: number,
  endM: number,
  notes?: string
) {
  const startedAt = atLocal(date, startH, startM);
  const endedAt = atLocal(date, endH, endM);
  await insertEvent({
    babyId,
    kind: 'sleep',
    occurredAt: endedAt,
    timePrecision: 'exact',
    payload: { startedAt, endedAt, minutes: minutesBetween(startedAt, endedAt) },
    notes: notes ?? null,
  });
}

async function logNappy(
  babyId: number,
  date: string,
  hour: number,
  minute: number,
  type: NappyType,
  extras?: { colour?: NappyColour; quantity?: number; precision?: TimePrecision; period?: TimePeriod; notes?: string }
) {
  const precision = extras?.precision ?? 'exact';
  const period = extras?.period;
  const occurredAt = precision === 'unknown'
    ? atLocal(date, 12, 0)
    : precision === 'period' && period
      ? atLocal(date, TIME_PERIOD_HOURS[period], 0)
      : atLocal(date, hour, minute);
  await insertNappies({
    babyId,
    type,
    quantity: extras?.quantity ?? 1,
    colour: extras?.colour,
    occurredAt,
    timePrecision: precision,
    timePeriod: period ?? null,
    notes: extras?.notes ?? null,
  });
}

async function seedTypicalDay(babyId: number, date: string, dayIndex: number) {
  const colour = COLOURS[dayIndex % COLOURS.length];
  const breastHeavy = dayIndex % 2 === 0;

  await logSleep(babyId, date, 0, 40 + (dayIndex % 3) * 8, 6, 8 + (dayIndex % 4) * 6);
  await logSleep(
    babyId,
    date,
    13,
    5 + (dayIndex % 5) * 4,
    15,
    20 + (dayIndex % 4) * 8,
    dayIndex === 3 ? 'Long afternoon nap after a walk' : undefined
  );
  await logSleep(babyId, date, 21, 10 + (dayIndex % 4) * 5, 23, 50);

  const feeds: Array<{ h: number; m: number; method: FeedMethod; minutes: number; notes?: string }> = [
    { h: 6, m: 20 + dayIndex, method: breastHeavy ? 'breast' : 'bottle', minutes: 16 + (dayIndex % 3) },
    { h: 9, m: 5 + dayIndex, method: 'breast', minutes: 14 + (dayIndex % 4) },
    { h: 12, m: 10, method: breastHeavy ? 'bottle' : 'breast', minutes: 11 + (dayIndex % 3) },
    { h: 15, m: 45, method: 'breast', minutes: 15, notes: dayIndex === 1 ? 'Cluster feeding' : undefined },
    { h: 18, m: 40 + (dayIndex % 5), method: breastHeavy ? 'breast' : 'bottle', minutes: 13 + (dayIndex % 2) },
    { h: 21, m: 5, method: dayIndex % 3 === 0 ? 'bottle' : 'breast', minutes: 17 },
  ];
  if (dayIndex % 3 === 1) {
    feeds.unshift({ h: 3, m: 15 + dayIndex, method: 'breast', minutes: 12, notes: 'Night feed' });
  }
  for (const feed of feeds) {
    await logFeed(babyId, date, feed.h, feed.m, feed.method, feed.minutes, { notes: feed.notes });
  }

  await logNappy(babyId, date, 6, 5, 'wet');
  await logNappy(babyId, date, 8, 20, dayIndex % 2 === 0 ? 'both' : 'dirty', { colour });
  await logNappy(babyId, date, 11, 15, NAPPY_TYPES[dayIndex % 3]);
  await logNappy(babyId, date, 14, 40, 'wet');
  await logNappy(babyId, date, 17, 50, dayIndex % 2 === 0 ? 'dirty' : 'both', {
    colour: COLOURS[(dayIndex + 2) % COLOURS.length],
  });
  await logNappy(babyId, date, 20, 10, 'wet');
  if (dayIndex % 2 === 0) {
    await logNappy(babyId, date, 21, 55, 'both', { colour: 'normal' });
  }
}

async function seedPeriodDay(babyId: number, date: string) {
  for (const period of TIME_PERIODS) {
    await logFeed(babyId, date, TIME_PERIOD_HOURS[period], 0, period === 'night' ? 'bottle' : 'breast', 14, {
      precision: 'period',
      period,
    });
    await logNappy(babyId, date, TIME_PERIOD_HOURS[period], 0, period === 'afternoon' ? 'dirty' : period === 'evening' ? 'both' : 'wet', {
      precision: 'period',
      period,
      colour: period === 'midday' ? 'yellow' : period === 'night' ? 'green' : 'normal',
    });
  }
  await logSleep(babyId, date, 1, 10, 5, 40, 'Slept through before daybreak');
  await logSleep(babyId, date, 13, 30, 16, 0);
}

async function seedUnknownDay(babyId: number, date: string) {
  await logNappy(babyId, date, 12, 0, 'both', {
    quantity: 4,
    precision: 'unknown',
    notes: 'Caught up later — times not recorded',
  });
  await logFeed(babyId, date, 12, 0, 'breast', 15, { precision: 'unknown', notes: 'Fed sometime today' });
  await logFeed(babyId, date, 12, 0, 'bottle', 10, { precision: 'unknown' });
  await logSleep(babyId, date, 14, 0, 16, 20, 'Nap time guessed');
  await logNappy(babyId, date, 7, 10, 'wet', { precision: 'exact' });
  await logNappy(babyId, date, 19, 20, 'dirty', { colour: 'dark_brown', precision: 'exact' });
}

export async function seedHistoricalNotes(babyId: number, options?: { force?: boolean }) {
  const version = await getMeta('demo_seed');
  if (!options?.force && version === DEMO_SEED_VERSION) return;

  await clearEventsForBaby(babyId);
  await upsertBaby(DEMO_BABY_NAME, DEMO_BABY_DOB);

  // Last 10 days through today: typical logs, plus dedicated period and unknown days.
  for (let offset = -9; offset <= 0; offset += 1) {
    const date = dayKey(offset);
    const dayIndex = offset + 9;
    if (offset === -8) {
      await seedPeriodDay(babyId, date);
      continue;
    }
    if (offset === -7) {
      await seedUnknownDay(babyId, date);
      continue;
    }
    await seedTypicalDay(babyId, date, dayIndex);
  }

  await setMeta('demo_seed', DEMO_SEED_VERSION);
}
