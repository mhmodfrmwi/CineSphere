import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Api } from '../../core/services/api/apiService/api';
import { Movie } from '../../core/models/movie';
import { Showtime } from '../../core/models/showtime';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Seat } from '../../core/models/Seat';
import { CreateBookingDTO } from '../../core/models/CreateBookingDTO';
import { AuthService } from '../../core/services/api/authService/auth-service';
import { Review } from '../../core/models/Review';
import { Hall } from '../../core/models/Hall';
import { PaymentMethod, PAYMENT_METHOD_LABELS } from '../../core/models/PaymentMethod';

@Component({
  selector: 'app-movie-details',
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './movie-details.html',
  styleUrl: './movie-details.css',
})
export class MovieDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(Api);
  private authService = inject(AuthService);

  movie = signal<Movie | null>(null);
  showtimes = signal<Showtime[]>([]);
  halls = signal<Record<number, Hall>>({});
  selectedShowtime = signal<Showtime | null>(null);
  seats = signal<Seat[]>([]);
  reviews = signal<Review[]>([]);
  selectedSeatsIds = signal<number[]>([]);
  bookingSuccess = signal(false);
  reviewMessage = signal('');
  paymentMethod = signal(PaymentMethod.CreditCard);
  editingReviewId = signal<number | null>(null);

  readonly paymentMethods = Object.values(PaymentMethod).filter((v) => typeof v === 'number') as PaymentMethod[];
  readonly paymentLabels = PAYMENT_METHOD_LABELS;

  isLoggedIn = computed(() => !!this.authService.currentUserToken());
  averageRating = computed(() => {
    const r = this.reviews();
    if (!r.length) return 0;
    return r.reduce((sum, rev) => sum + rev.rating, 0) / r.length;
  });

  reviewForm = new FormGroup({
    rating: new FormControl(5, [Validators.required, Validators.min(1), Validators.max(5)]),
    comment: new FormControl('', Validators.required),
  });

  constructor() {
    effect(() => {
      const showtime = this.selectedShowtime();
      if (showtime) {
        this.selectedSeatsIds.set([]);
        this.apiService.getSeatsByShowtimeId(showtime.id).subscribe({
          next: (data) => this.seats.set(data),
          error: (err) => console.error('Error fetching seats:', err),
        });
      } else {
        this.seats.set([]);
      }
    });
  }

  ngOnInit() {
    this.fetchMovieDetails();
    this.fetchShowtimes();
    this.fetchReviews();
  }

  fetchMovieDetails() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.apiService.getMovieById(id).subscribe({
      next: (data) => this.movie.set(data),
      error: (err) => console.error('Error fetching movie details:', err),
    });
  }

  fetchShowtimes() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.apiService.getShowtimesByMovieId(id).subscribe({
      next: (data) => {
        this.showtimes.set(data);
        data.forEach((st) => {
          if (!this.halls()[st.hallId]) {
            this.apiService.getHallById(st.hallId).subscribe({
              next: (hall) => this.halls.update((h) => ({ ...h, [hall.id]: hall })),
            });
          }
        });
      },
      error: (err) => console.error('Error fetching show times:', err),
    });
  }

  fetchReviews() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.apiService.getReviewsByMovieId(id).subscribe({
      next: (data) => this.reviews.set(data),
      error: (err) => console.error('Error fetching reviews:', err),
    });
  }

  hallName(hallId: number): string {
    return this.halls()[hallId]?.name ?? `Hall #${hallId}`;
  }

  reserveSeat(seatId: number) {
    const seat = this.seats().find((s) => s.id === seatId);
    if (!seat?.isAvailable) return;
    if (this.selectedSeatsIds().includes(seat.id)) {
      this.selectedSeatsIds.update((ids) => ids.filter((id) => id !== seat.id));
    } else {
      this.selectedSeatsIds.update((ids) => [...ids, seat.id]);
    }
  }

  createBooking() {
    if (!this.selectedShowtime() || this.selectedSeatsIds().length === 0) return;
    if (!this.authService.currentUserToken()) {
      this.router.navigate(['/login']);
      return;
    }
    const bookingData: CreateBookingDTO = {
      showtimeId: this.selectedShowtime()!.id,
      seatIds: this.selectedSeatsIds(),
      paymentMethod: this.paymentMethod(),
    };
    this.apiService.createBooking(bookingData).subscribe({
      next: () => {
        this.bookingSuccess.set(true);
        this.selectedSeatsIds.set([]);
        this.apiService.getSeatsByShowtimeId(this.selectedShowtime()!.id).subscribe({
          next: (data) => this.seats.set(data),
        });
      },
      error: (err) => console.error('Error creating booking:', err),
    });
  }

  submitReview() {
    if (!this.reviewForm.valid || !this.movie()) return;
    if (!this.authService.currentUserToken()) {
      this.router.navigate(['/login']);
      return;
    }
    this.apiService
      .createReview({
        movieId: this.movie()!.id,
        rating: this.reviewForm.value.rating!,
        comment: this.reviewForm.value.comment!,
      })
      .subscribe({
        next: () => {
          this.reviewMessage.set('Review submitted!');
          this.reviewForm.reset({ rating: 5 });
          this.fetchReviews();
        },
        error: () => this.reviewMessage.set('Failed to submit review.'),
      });
  }

  startEditReview(review: Review) {
    this.editingReviewId.set(review.id);
    this.reviewForm.patchValue({ rating: review.rating, comment: review.comment });
  }

  cancelEditReview() {
    this.editingReviewId.set(null);
    this.reviewForm.reset({ rating: 5 });
  }

  saveReview() {
    const id = this.editingReviewId();
    if (!id || !this.reviewForm.valid) return;
    this.apiService
      .updateReview(id, {
        rating: this.reviewForm.value.rating!,
        comment: this.reviewForm.value.comment!,
      })
      .subscribe({
        next: () => {
          this.editingReviewId.set(null);
          this.reviewForm.reset({ rating: 5 });
          this.fetchReviews();
        },
        error: () => this.reviewMessage.set('Failed to update review.'),
      });
  }

  deleteReview(id: number) {
    this.apiService.deleteReview(id).subscribe({
      next: () => this.fetchReviews(),
      error: () => this.reviewMessage.set('Failed to delete review.'),
    });
  }
}
