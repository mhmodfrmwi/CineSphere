import { Showtime } from '../models/showtime';

export interface ShowtimeDayGroup {
  dateKey: string;
  label: string;
  weekday: string;
  dayNumber: string;
  showtimes: Showtime[];
}

export function dateKeyFromIso(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getUpcomingShowtimes(showtimes: Showtime[], now = new Date()): Showtime[] {
  return showtimes
    .filter((st) => new Date(st.startTime) > now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

export function groupShowtimesByDay(showtimes: Showtime[], now = new Date()): ShowtimeDayGroup[] {
  const upcoming = getUpcomingShowtimes(showtimes, now);
  const groups = new Map<string, Showtime[]>();

  for (const st of upcoming) {
    const key = dateKeyFromIso(st.startTime);
    const list = groups.get(key) ?? [];
    list.push(st);
    groups.set(key, list);
  }

  return Array.from(groups.entries()).map(([dateKey, items]) => {
    const d = parseDateKey(dateKey);
    return {
      dateKey,
      label: formatDayLabel(d, now),
      weekday: d.toLocaleDateString(undefined, { weekday: 'short' }),
      dayNumber: String(d.getDate()),
      showtimes: items.sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      ),
    };
  });
}

function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDayLabel(date: Date, now: Date): string {
  const today = startOfDay(now);
  const target = startOfDay(date);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
