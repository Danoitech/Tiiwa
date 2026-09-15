export type EventKind = 'feed' | 'sleep' | 'nappy';
export type TimePrecision = 'exact' | 'period' | 'unknown';
export type NappyType = 'wet' | 'dirty' | 'both';
export type FeedMethod = 'breast' | 'bottle';
export type NappyColour = 'normal' | 'light_brown' | 'dark_brown' | 'green' | 'yellow' | 'other';

export type Baby = {
  id: number;
  name: string;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
};

export type EventRow = {
  id: number;
  baby_id: number;
  kind: EventKind;
  occurred_at: string | null;
  time_precision: TimePrecision;
  time_period: string | null;
  payload: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type NappyPayload = {
  type: NappyType;
  colour?: NappyColour | null;
};

export type FeedPayload = {
  method: FeedMethod;
  minutes: number;
};

export type SleepPayload = {
  startedAt: string;
  endedAt: string;
  minutes: number;
};

export type EventPayload = NappyPayload | FeedPayload | SleepPayload;
