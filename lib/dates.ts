export function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function dateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function toLocalIso(d: Date) {
  return `${dateKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function parseLocalIso(iso: string) {
  const [date, time = '00:00:00'] = iso.split('T');
  const [y, m, day] = date.split('-').map(Number);
  const [hh, mm, ss] = time.split(':').map(Number);
  return new Date(y, m - 1, day, hh || 0, mm || 0, ss || 0);
}

export function atLocal(date: string, hours = 0, minutes = 0) {
  const [y, m, day] = date.split('-').map(Number);
  return toLocalIso(new Date(y, m - 1, day, hours, minutes, 0));
}

export function addDays(d: Date, n: number) {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatLongDate(d: Date) {
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatShortDate(d: Date) {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatTime(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export const TIME_PERIODS = [
  'before_daybreak',
  'morning',
  'midday',
  'afternoon',
  'evening',
  'night',
] as const;

export type TimePeriod = (typeof TIME_PERIODS)[number];

export const TIME_PERIOD_LABELS: Record<TimePeriod, string> = {
  before_daybreak: 'Before daybreak',
  morning: 'Morning',
  midday: 'Midday',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Night',
};

export const TIME_PERIOD_HOURS: Record<TimePeriod, number> = {
  before_daybreak: 5,
  morning: 8,
  midday: 12,
  afternoon: 15,
  evening: 19,
  night: 22,
};
