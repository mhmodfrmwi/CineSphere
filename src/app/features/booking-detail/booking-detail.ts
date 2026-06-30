import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Api } from '../../core/services/api/apiService/api';
import { BookingDTO } from '../../core/models/BookingDTO';
import { Showtime } from '../../core/models/showtime';
import { Hall } from '../../core/models/Hall';
import { getSeatLabels } from '../../core/utils/booking-utils';

@Component({
  selector: 'app-booking-detail',
  imports: [RouterLink, DatePipe, DecimalPipe],
  templateUrl: './booking-detail.html',
  styleUrl: './booking-detail.css',
})
export class BookingDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(Api);
  private destroyRef = inject(DestroyRef);

  booking = signal<BookingDTO | null>(null);
  showtime = signal<Showtime | null>(null);
  hall = signal<Hall | null>(null);
  loading = signal(true);
  error = signal(false);
  cancelled = signal(false);
  message = signal('');

  ngOnInit() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = Number(params.get('id'));
      if (!id || Number.isNaN(id)) {
        this.error.set(true);
        this.loading.set(false);
        return;
      }
      this.loadBooking(id);
    });
  }

  seatLabels(): string[] {
    const b = this.booking();
    return b ? getSeatLabels(b) : [];
  }

  cancelBooking() {
    const b = this.booking();
    if (!b) return;
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    this.api.cancelBooking(b.bookingId).subscribe({
      next: () => {
        this.cancelled.set(true);
        this.message.set('Booking cancelled successfully.');
      },
      error: () => this.message.set('Failed to cancel booking.'),
    });
  }

  private loadBooking(id: number) {
    this.loading.set(true);
    this.error.set(false);
    this.booking.set(null);
    this.api.getBookingById(id).subscribe({
      next: (data) => {
        this.booking.set(data);
        this.cancelled.set(data.status === 'Canceled');
        this.loadShowtimeDetails(data.showtimeId);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
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
