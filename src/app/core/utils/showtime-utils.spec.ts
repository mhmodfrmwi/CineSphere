import { groupShowtimesByDay, getUpcomingShowtimes, dateKeyFromIso } from './showtime-utils';
import { Showtime } from '../models/showtime';

function st(id: number, iso: string): Showtime {
  return { id, movieId: 1, hallId: 1, startTime: iso, ticketPrice: 100 };
}

describe('showtime-utils', () => {
  const now = new Date('2026-06-30T12:00:00');

  it('filters past showtimes and sorts by start time', () => {
    const result = getUpcomingShowtimes(
      [
        st(1, '2026-06-30T10:00:00'),
        st(2, '2026-06-30T20:00:00'),
        st(3, '2026-06-29T20:00:00'),
        st(4, '2026-07-01T14:00:00'),
      ],
      now,
    );

    expect(result.map((s) => s.id)).toEqual([2, 4]);
  });

  it('groups upcoming showtimes by local calendar day', () => {
    const groups = groupShowtimesByDay(
      [
        st(1, '2026-06-30T20:00:00'),
        st(2, '2026-06-30T17:00:00'),
        st(3, '2026-07-01T14:00:00'),
      ],
      now,
    );

    expect(groups).toHaveLength(2);
    expect(groups[0].label).toBe('Today');
    expect(groups[0].showtimes.map((s) => s.id)).toEqual([2, 1]);
    expect(groups[1].label).toBe('Tomorrow');
  });

  it('builds stable date keys from ISO strings', () => {
    expect(dateKeyFromIso('2026-07-01T14:00:00.000Z')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
