import { atLocal } from '@/lib/dates';
import { countEvents, insertEvent, insertNappies } from './queries';

export async function seedHistoricalNotes(babyId: number) {
  if ((await countEvents()) > 0) return;

  await insertNappies({ babyId, type: 'wet', quantity: 1, occurredAt: atLocal('2026-09-06', 18, 0), timePrecision: 'exact' });
  await insertNappies({ babyId, type: 'dirty', quantity: 1, occurredAt: atLocal('2026-09-06', 18, 0), timePrecision: 'exact' });

  await insertNappies({ babyId, type: 'dirty', quantity: 1, occurredAt: atLocal('2026-09-07', 22, 0), timePrecision: 'exact' });
  await insertNappies({ babyId, type: 'dirty', quantity: 1, occurredAt: atLocal('2026-09-07', 23, 0), timePrecision: 'exact' });

  await insertNappies({ babyId, type: 'dirty', quantity: 1, occurredAt: atLocal('2026-09-08', 3, 0), timePrecision: 'exact' });
  await insertNappies({ babyId, type: 'both', quantity: 1, occurredAt: atLocal('2026-09-08', 12, 0), timePrecision: 'period', timePeriod: 'midday' });
  await insertNappies({
    babyId,
    type: 'dirty',
    quantity: 1,
    colour: 'light_brown',
    occurredAt: atLocal('2026-09-08', 21, 0),
    timePrecision: 'exact',
  });

  await insertNappies({ babyId, type: 'wet', quantity: 1, occurredAt: atLocal('2026-09-09', 2, 30), timePrecision: 'exact' });
  await insertNappies({ babyId, type: 'dirty', quantity: 2, occurredAt: atLocal('2026-09-09', 8, 0), timePrecision: 'period', timePeriod: 'morning' });
  await insertNappies({ babyId, type: 'dirty', quantity: 2, occurredAt: atLocal('2026-09-09', 19, 0), timePrecision: 'period', timePeriod: 'evening' });
  await insertNappies({ babyId, type: 'both', quantity: 2, occurredAt: atLocal('2026-09-09', 12, 0), timePrecision: 'period', timePeriod: 'midday' });

  await insertNappies({ babyId, type: 'wet', quantity: 2, occurredAt: atLocal('2026-09-10', 7, 0), timePrecision: 'period', timePeriod: 'morning' });
  await insertNappies({ babyId, type: 'dirty', quantity: 3, occurredAt: atLocal('2026-09-10', 15, 0), timePrecision: 'period', timePeriod: 'afternoon' });
  await insertNappies({ babyId, type: 'both', quantity: 1, occurredAt: atLocal('2026-09-10', 22, 0), timePrecision: 'period', timePeriod: 'night' });

  await insertNappies({ babyId, type: 'wet', quantity: 2, occurredAt: atLocal('2026-09-11', 6, 0), timePrecision: 'period', timePeriod: 'morning' });
  await insertNappies({ babyId, type: 'dirty', quantity: 2, occurredAt: atLocal('2026-09-11', 14, 0), timePrecision: 'period', timePeriod: 'afternoon' });
  await insertNappies({ babyId, type: 'both', quantity: 1, occurredAt: atLocal('2026-09-11', 20, 0), timePrecision: 'period', timePeriod: 'evening' });

  await insertNappies({
    babyId,
    type: 'both',
    quantity: 2,
    occurredAt: atLocal('2026-09-12', 5, 0),
    timePrecision: 'period',
    timePeriod: 'before_daybreak',
  });
  await insertNappies({
    babyId,
    type: 'both',
    quantity: 6,
    occurredAt: atLocal('2026-09-12', 12, 0),
    timePrecision: 'unknown',
  });

  await insertNappies({
    babyId,
    type: 'both',
    quantity: 3,
    occurredAt: atLocal('2026-09-13', 8, 0),
    timePrecision: 'period',
    timePeriod: 'morning',
  });

  await insertNappies({ babyId, type: 'wet', quantity: 1, occurredAt: atLocal('2026-09-14', 0, 30), timePrecision: 'exact' });
  await insertEvent({
    babyId,
    kind: 'feed',
    occurredAt: atLocal('2026-09-14', 0, 50),
    timePrecision: 'exact',
    payload: { method: 'breast', minutes: 15 },
  });
  await insertEvent({
    babyId,
    kind: 'sleep',
    occurredAt: atLocal('2026-09-14', 3, 25),
    timePrecision: 'exact',
    payload: {
      startedAt: atLocal('2026-09-14', 1, 10),
      endedAt: atLocal('2026-09-14', 3, 25),
      minutes: 135,
    },
  });
  await insertEvent({
    babyId,
    kind: 'feed',
    occurredAt: atLocal('2026-09-14', 3, 45),
    timePrecision: 'exact',
    payload: { method: 'bottle', minutes: 12 },
  });
  await insertNappies({ babyId, type: 'both', quantity: 1, occurredAt: atLocal('2026-09-14', 4, 0), timePrecision: 'exact' });
  await insertEvent({
    babyId,
    kind: 'feed',
    occurredAt: atLocal('2026-09-14', 6, 10),
    timePrecision: 'exact',
    payload: { method: 'breast', minutes: 18 },
  });
  await insertNappies({ babyId, type: 'wet', quantity: 1, occurredAt: atLocal('2026-09-14', 8, 20), timePrecision: 'exact' });
  await insertEvent({
    babyId,
    kind: 'feed',
    occurredAt: atLocal('2026-09-14', 9, 0),
    timePrecision: 'exact',
    payload: { method: 'breast', minutes: 16 },
  });
  await insertNappies({ babyId, type: 'dirty', quantity: 1, occurredAt: atLocal('2026-09-14', 11, 15), timePrecision: 'exact' });
  await insertEvent({
    babyId,
    kind: 'feed',
    occurredAt: atLocal('2026-09-14', 12, 5),
    timePrecision: 'exact',
    payload: { method: 'bottle', minutes: 10 },
  });
  await insertNappies({ babyId, type: 'both', quantity: 1, occurredAt: atLocal('2026-09-14', 14, 40), timePrecision: 'exact' });
  await insertEvent({
    babyId,
    kind: 'sleep',
    occurredAt: atLocal('2026-09-14', 16, 10),
    timePrecision: 'exact',
    payload: {
      startedAt: atLocal('2026-09-14', 13, 20),
      endedAt: atLocal('2026-09-14', 16, 10),
      minutes: 170,
    },
  });
  await insertEvent({
    babyId,
    kind: 'feed',
    occurredAt: atLocal('2026-09-14', 16, 30),
    timePrecision: 'exact',
    payload: { method: 'breast', minutes: 14 },
  });
  await insertNappies({ babyId, type: 'wet', quantity: 1, occurredAt: atLocal('2026-09-14', 17, 50), timePrecision: 'exact' });
  await insertEvent({
    babyId,
    kind: 'feed',
    occurredAt: atLocal('2026-09-14', 18, 40),
    timePrecision: 'exact',
    payload: { method: 'breast', minutes: 15 },
  });
  await insertNappies({ babyId, type: 'dirty', quantity: 1, occurredAt: atLocal('2026-09-14', 20, 10), timePrecision: 'exact' });
  await insertEvent({
    babyId,
    kind: 'feed',
    occurredAt: atLocal('2026-09-14', 21, 5),
    timePrecision: 'exact',
    payload: { method: 'breast', minutes: 17 },
  });
  await insertNappies({ babyId, type: 'both', quantity: 1, occurredAt: atLocal('2026-09-14', 21, 0), timePrecision: 'exact' });
}
