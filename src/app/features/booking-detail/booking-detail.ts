import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Api } from '../../core/services/api/apiService/api';
import { BookingDTO } from '../../core/models/BookingDTO';
import { Showtime } from '../../core/models/showtime';
import { Hall } from '../../core/models/Hall';

@Component({
  selector: 'app-booking-detail',
  imports: [RouterLink, DatePipe],
  templateUrl: './booking-detail.html',
  styleUrl: './booking-detail.css',
})
export class BookingDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(Api);

  booking = signal<BookingDTO | null>(null);
  showtime = signal<Showtime | null>(null);
  hall = signal<Hall | null>(null);
  loading = signal(true);
  error = signal(false);
  cancelled = signal(false);
  message = signal('');

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getBookingById(id).subscribe({
      next: (data) => {
        this.booking.set(data);
        this.loadShowtimeDetails(data.showtimeId);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  cancelBooking() {
    const b = this.booking();
    if (!b) return;
    this.api.cancelBooking(b.bookingId).subscribe({
      next: () => {
        this.cancelled.set(true);
        this.message.set('Booking cancelled successfully.');
      },
      error: () => this.message.set('Failed to cancel booking.'),
    });
  }

  private loadShowtimeDetails(showtimeId: number) {
    this.api.getShowtimeById(showtimeId).subscribe({
      next: (st) => {
        this.showtime.set(st);
        this.api.getHallById(st.hallId).subscribe({
          next: (h) => {
            this.hall.set(h);
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
      },
      error: () => this.loading.set(false),
    });
  }
}
