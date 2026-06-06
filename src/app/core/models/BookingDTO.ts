export interface BookingDTO {
  bookingId: number;
  bookingDate: string;
  totalPrice: number;
  showtimeId: number;
  seatIds: number[];
}
