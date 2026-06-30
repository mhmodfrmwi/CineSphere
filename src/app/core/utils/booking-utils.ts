import { BookingDTO } from '../models/BookingDTO';

export function getSeatLabels(booking: BookingDTO): string[] {
  return booking.seatLabels?.length ? booking.seatLabels : booking.seatIds.map(String);
}
