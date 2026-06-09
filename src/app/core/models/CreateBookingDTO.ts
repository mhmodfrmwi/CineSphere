import { PaymentMethod } from './PaymentMethod';

export interface CreateBookingDTO {
  showtimeId: number;
  seatIds: number[];
  paymentMethod: PaymentMethod;
}
