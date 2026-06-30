import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Api } from '../../core/services/api/apiService/api';
import { BookingDTO } from '../../core/models/BookingDTO';
import { getSeatLabels } from '../../core/utils/booking-utils';

@Component({
  selector: 'app-user-bookings',
  imports: [RouterLink, DatePipe, DecimalPipe],
  templateUrl: './user-bookings.html',
  styleUrl: './user-bookings.css',
})
export class UserBookings implements OnInit {
  private apiService = inject(Api);
  bookings = signal<BookingDTO[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.fetchUserBookings();
  }

  fetchUserBookings() {
    this.apiService.getUserBookings().subscribe({
      next: (data) => {
        this.bookings.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Unable to load your bookings. Please try again later.');
        this.loading.set(false);
      },
    });
  }

  seatLabels = getSeatLabels;

  isCanceled(booking: BookingDTO): boolean {
    return booking.status === 'Canceled';
  }
}
