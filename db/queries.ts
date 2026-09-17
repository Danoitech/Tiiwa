import { dateKey, parseLocalIso, TIME_PERIOD_LABELS, toLocalIso, type TimePeriod } from '@/lib/dates';
import { getDb } from './client';
import type { Baby, EventKind, EventPayload, EventRow, FeedPayload, NappyPayload, SleepPayload, TimePrecision } from './types';

export async function getMeta(key: string) {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM meta WHERE key = ?', key);
  return row?.value ?? null;
}

export async function setMeta(key: string, value: string) {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    value
  );
}

export async function getBaby() {
  const db = await getDb();
  return db.getFirstAsync<Baby>('SELECT * FROM babies ORDER BY id LIMIT 1');
}

export async function upsertBaby(name: string, dateOfBirth: string | null) {
  const db = await getDb();
  const now = toLocalIso(new Date());
  const existing = await getBaby();
  if (existing) {
    await db.runAsync(
      'UPDATE babies SET name = ?, date_of_birth = ?, updated_at = ? WHERE id = ?',
      name,
      dateOfBirth,
      now,
      existing.id
    );
    return { ...existing, name, date_of_birth: dateOfBirth, updated_at: now };
  }
  const result = await db.runAsync(
    'INSERT INTO babies (name, date_of_birth, created_at, updated_at) VALUES (?, ?, ?, ?)',
    name,
    dateOfBirth,
    now,
    now
  );
  return {
    id: result.lastInsertRowId,
    name,
    date_of_birth: dateOfBirth,
    created_at: now,
    updated_at: now,
  } satisfies Baby;
}

export function parsePayload<T extends EventPayload>(row: EventRow): T {
  try {
    return JSON.parse(row.payload) as T;
  } catch {
    return {} as T;
  }
}

export async function insertEvent(input: {
  babyId: number;
  kind: EventKind;
  occurredAt: string | null;
  timePrecision: TimePrecision;
  timePeriod?: string | null;
  payload: EventPayload;
  notes?: string | null;
}) {
  const db = await getDb();
  const now = toLocalIso(new Date());
  const result = await db.runAsync(
    `INSERT INTO events (baby_id, kind, occurred_at, time_precision, time_period, payload, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    input.babyId,
    input.kind,
    input.occurredAt,
    input.timePrecision,
    input.timePeriod ?? null,
    JSON.stringify(input.payload),
    input.notes ?? null,
    now,
    now
  );
  return result.lastInsertRowId;
}

export async function insertNappies(input: {
  babyId: number;
  type: NappyPayload['type'];
  quantity: number;
  colour?: NappyPayload['colour'];
  notes?: string | null;
  occurredAt: string | null;
  timePrecision: TimePrecision;
  timePeriod?: string | null;
}) {
  const ids: number[] = [];
  for (let i = 0; i < input.quantity; i += 1) {
    const id = await insertEvent({
      babyId: input.babyId,
      kind: 'nappy',
      occurredAt: input.occurredAt,
      timePrecision: input.timePrecision,
      timePeriod: input.timePeriod,
      payload: { type: input.type, colour: input.colour ?? null },
      notes: input.notes,
    });
    ids.push(id);
  }
  return ids;
}

export async function countEvents() {
  const db = await getDb();
  const row = await db.getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) as n FROM events WHERE deleted_at IS NULL'
  );
  return row?.n ?? 0;
}

export async function clearEventsForBaby(babyId: number) {
  const db = await getDb();
  await db.runAsync('DELETE FROM events WHERE baby_id = ?', babyId);
}

export async function getEventsForDate(babyId: number, key: string) {
  const db = await getDb();
  return db.getAllAsync<EventRow>(
    `SELECT * FROM events
     WHERE baby_id = ? AND deleted_at IS NULL AND occurred_at IS NOT NULL AND substr(occurred_at, 1, 10) = ?
     ORDER BY
       CASE time_precision WHEN 'unknown' THEN 0 WHEN 'period' THEN 1 ELSE 2 END DESC,
       occurred_at DESC,
       id DESC`,
    babyId,
    key
  );
}

export async function getRecentEvents(babyId: number, limit = 8) {
  const db = await getDb();
  return db.getAllAsync<EventRow>(
    `SELECT * FROM events
     WHERE baby_id = ? AND deleted_at IS NULL
     ORDER BY COALESCE(occurred_at, created_at) DESC, id DESC
     LIMIT ?`,
    babyId,
    limit
  );
}

export async function getAllEvents(babyId: number) {
  const db = await getDb();
  return db.getAllAsync<EventRow>(
    `SELECT * FROM events
     WHERE baby_id = ? AND deleted_at IS NULL
     ORDER BY COALESCE(occurred_at, created_at) DESC, id DESC`,
    babyId
  );
}

export async function deleteEvent(id: number) {
  const db = await getDb();
  await db.runAsync('UPDATE events SET deleted_at = ?, updated_at = ? WHERE id = ?', toLocalIso(new Date()), toLocalIso(new Date()), id);
}

export function nappyLabel(type: NappyPayload['type']) {
  if (type === 'both') return 'Wet and dirty nappy';
  if (type === 'wet') return 'Wet nappy';
  return 'Dirty nappy';
}

export function eventLabel(row: EventRow) {
  if (row.kind === 'nappy') {
    const payload = parsePayload<NappyPayload>(row);
    const colour = payload.colour && payload.colour !== 'normal'
      ? ` (${payload.colour.replace('_', ' ')})`
      : '';
    return `${nappyLabel(payload.type)}${colour}`;
  }
  if (row.kind === 'feed') {
    const payload = parsePayload<FeedPayload>(row);
    const method = payload.method === 'breast' ? 'Breast' : 'Bottle';
    return `${method}, ${payload.minutes} min`;
  }
  const payload = parsePayload<SleepPayload>(row);
  return `Sleep logged, ${payload.minutes}m`;
}

export function eventTimeLabel(row: EventRow) {
  if (row.time_precision === 'unknown') return 'Time not recorded';
  if (row.time_precision === 'period' && row.time_period) {
    return TIME_PERIOD_LABELS[row.time_period as TimePeriod] ?? row.time_period;
  }
  if (!row.occurred_at) return 'Time not recorded';
  return parseLocalIso(row.occurred_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function hourForEvent(row: EventRow) {
  if (row.time_precision === 'unknown' || !row.occurred_at) return null;
  if (row.time_precision === 'period' && row.time_period) {
    return TIME_PERIOD_HOURS_SAFE[row.time_period] ?? 12;
  }
  return parseLocalIso(row.occurred_at).getHours();
}

const TIME_PERIOD_HOURS_SAFE: Record<string, number> = {
  before_daybreak: 5,
  morning: 8,
  midday: 12,
  afternoon: 15,
  evening: 19,
  night: 22,
};

export type DayStats = {
  feeds: number;
  nappies: number;
  nappyWet: number;
  nappyDirty: number;
  nappyBoth: number;
  sleepMinutes: number;
  feedHours: number[];
  nappyHours: number[];
  sleepBands: { start: number; end: number }[];
};

export function statsFromEvents(rows: EventRow[]): DayStats {
  const stats: DayStats = {
    feeds: 0,
    nappies: 0,
    nappyWet: 0,
    nappyDirty: 0,
    nappyBoth: 0,
    sleepMinutes: 0,
    feedHours: [],
    nappyHours: [],
    sleepBands: [],
  };

  for (const row of rows) {
    const hour = hourForEvent(row);
    if (row.kind === 'feed') {
      stats.feeds += 1;
      if (hour != null) stats.feedHours.push(hour);
    } else if (row.kind === 'nappy') {
      stats.nappies += 1;
      const payload = parsePayload<NappyPayload>(row);
      if (payload.type === 'wet') stats.nappyWet += 1;
      else if (payload.type === 'dirty') stats.nappyDirty += 1;
      else stats.nappyBoth += 1;
      if (hour != null) stats.nappyHours.push(hour);
    } else {
      const payload = parsePayload<SleepPayload>(row);
      stats.sleepMinutes += payload.minutes || 0;
      if (payload.startedAt && payload.endedAt) {
        const start = parseLocalIso(payload.startedAt);
        const end = parseLocalIso(payload.endedAt);
        if (dateKey(start) === dateKey(end)) {
          stats.sleepBands.push({
            start: start.getHours() + start.getMinutes() / 60,
            end: end.getHours() + end.getMinutes() / 60,
          });
        }
      }
    }
  }
  return stats;
}

export async function exportCsv(babyId: number) {
  const rows = await getAllEvents(babyId);
  const header = 'date,time,kind,type,minutes,colour,time_precision,time_period,notes';
  const lines = rows.map((row) => {
    const date = row.occurred_at ? row.occurred_at.slice(0, 10) : '';
    const time = eventTimeLabel(row);
    let type = '';
    let minutes = '';
    let colour = '';
    if (row.kind === 'nappy') {
      const payload = parsePayload<NappyPayload>(row);
      type = payload.type;
      colour = payload.colour ?? '';
    } else if (row.kind === 'feed') {
      const payload = parsePayload<FeedPayload>(row);
      type = payload.method;
      minutes = String(payload.minutes);
    } else {
      const payload = parsePayload<SleepPayload>(row);
      minutes = String(payload.minutes);
    }
    const notes = (row.notes ?? '').replaceAll('"', '""');
    return [date, time, row.kind, type, minutes, colour, row.time_precision, row.time_period ?? '', `"${notes}"`].join(',');
  });
  return [header, ...lines].join('\n');
}
