import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Api } from '../../core/services/api/apiService/api';
import { Movie } from '../../core/models/movie';
import { Showtime } from '../../core/models/showtime';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Seat } from '../../core/models/Seat';
import { CreateBookingDTO } from '../../core/models/CreateBookingDTO';
import { AuthService } from '../../core/services/api/authService/auth-service';
import { Review } from '../../core/models/Review';
import { Hall } from '../../core/models/Hall';
import { Cinema } from '../../core/models/Cinema';
import { PaymentMethod, PAYMENT_METHOD_LABELS } from '../../core/models/PaymentMethod';
import { AssetUrlPipe } from '../../core/pipes/asset-url-pipe';
import { SafeUrlPipe } from '../../core/pipes/safe-url-pipe';
import { parseApiError } from '../../core/utils/api-error';
import {
  dateKeyFromIso,
  groupShowtimesByDay,
  ShowtimeDayGroup,
} from '../../core/utils/showtime-utils';

@Component({
  selector: 'app-movie-details',
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule, RouterLink, AssetUrlPipe, SafeUrlPipe],
  templateUrl: './movie-details.html',
  styleUrl: './movie-details.css',
})
export class MovieDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(Api);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  movie = signal<Movie | null>(null);
  showtimes = signal<Showtime[]>([]);
  showtimeDays = signal<ShowtimeDayGroup[]>([]);
  selectedDateKey = signal<string | null>(null);
  halls = signal<Record<number, Hall>>({});
  cinemas = signal<Record<number, Cinema>>({});
  selectedShowtime = signal<Showtime | null>(null);
  seats = signal<Seat[]>([]);
  reviews = signal<Review[]>([]);
  selectedSeatsIds = signal<number[]>([]);
  bookingSuccess = signal(false);
  bookingError = signal('');
  bookingInProgress = signal(false);
  reviewMessage = signal('');
  paymentMethod = signal(PaymentMethod.Visa);
  editingReviewId = signal<number | null>(null);
  loading = signal(true);
  error = signal(false);
  private seatFetchId = 0;

  readonly paymentMethods = Object.values(PaymentMethod).filter((v) => typeof v === 'number') as PaymentMethod[];
  readonly paymentLabels = PAYMENT_METHOD_LABELS;

  isLoggedIn = computed(() => !!this.authService.currentUserToken());
  isAdmin = computed(() => this.authService.isAdmin());
  currentUserId = computed(() => this.authService.currentUserId());
  averageRating = computed(() => {
    const r = this.reviews();
    if (!r.length) return 0;
    return r.reduce((sum, rev) => sum + rev.rating, 0) / r.length;
  });
  selectedDayShowtimes = computed(() => {
    const key = this.selectedDateKey();
    if (!key) return [];
    return this.showtimeDays().find((d) => d.dateKey === key)?.showtimes ?? [];
  });
  hasUpcomingShowtimes = computed(() => this.showtimeDays().length > 0);

  reviewForm = new FormGroup({
    rating: new FormControl(5, [Validators.required, Validators.min(1), Validators.max(5)]),
    comment: new FormControl('', Validators.required),
  });

  ngOnInit() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = Number(params.get('id'));
      if (!id || Number.isNaN(id)) {
        this.loading.set(false);
        this.error.set(true);
        return;
      }
      this.resetPageState();
      this.loadMovie(id);
    });
  }

  private resetPageState() {
    this.movie.set(null);
    this.showtimes.set([]);
    this.showtimeDays.set([]);
    this.selectedDateKey.set(null);
    this.halls.set({});
    this.cinemas.set({});
    this.selectedShowtime.set(null);
    this.seats.set([]);
    this.reviews.set([]);
    this.selectedSeatsIds.set([]);
    this.bookingSuccess.set(false);
    this.bookingError.set('');
    this.loading.set(true);
    this.error.set(false);
  }

  private loadMovie(id: number) {
    this.apiService.getMovieById(id).subscribe({
      next: (data) => {
        this.movie.set(data);
        this.loading.set(false);
        this.fetchShowtimes(id);
        this.fetchReviews(id);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  fetchShowtimes(movieId: number) {
    this.apiService.getShowtimesByMovieId(movieId).subscribe({
      next: (data) => {
        this.showtimes.set(data);
        const days = groupShowtimesByDay(data);
        this.showtimeDays.set(days);
        this.selectedDateKey.set(days[0]?.dateKey ?? null);
        this.loadHallsAndCinemas(data);
      },
    });
  }

  private loadHallsAndCinemas(showtimes: Showtime[]) {
    const hallIds = [...new Set(showtimes.map((st) => st.hallId))].filter((id) => !this.halls()[id]);
    if (!hallIds.length) return;

    forkJoin(hallIds.map((id) => this.apiService.getHallById(id))).subscribe({
      next: (loadedHalls) => {
        const hallMap = { ...this.halls() };
        loadedHalls.forEach((hall) => {
          hallMap[hall.id] = hall;
        });
        this.halls.set(hallMap);

        const cinemaIds = [...new Set(loadedHalls.map((h) => h.cinemaId))].filter(
          (id) => !this.cinemas()[id],
        );
        if (!cinemaIds.length) return;

        forkJoin(cinemaIds.map((id) => this.apiService.getCinemaById(id))).subscribe({
          next: (loadedCinemas) => {
            const cinemaMap = { ...this.cinemas() };
            loadedCinemas.forEach((cinema) => {
              cinemaMap[cinema.id] = cinema;
            });
            this.cinemas.set(cinemaMap);
          },
        });
      },
    });
  }

  selectDate(dateKey: string) {
    this.selectedDateKey.set(dateKey);
    const selected = this.selectedShowtime();
    if (selected && dateKeyFromIso(selected.startTime) !== dateKey) {
      this.selectedShowtime.set(null);
      this.seats.set([]);
      this.selectedSeatsIds.set([]);
      this.bookingError.set('');
    }
  }

  fetchReviews(movieId: number) {
    this.apiService.getReviewsByMovieId(movieId).subscribe({
      next: (data) => this.reviews.set(data),
    });
  }

  selectShowtime(showtime: Showtime) {
    this.selectedShowtime.set(showtime);
    this.selectedSeatsIds.set([]);
    this.bookingSuccess.set(false);
    this.bookingError.set('');
    const fetchId = ++this.seatFetchId;
    this.apiService.getSeatsByShowtimeId(showtime.id).subscribe({
      next: (data) => {
        if (fetchId === this.seatFetchId) this.seats.set(data);
      },
    });
  }

  hallLocation(hallId: number): string {
    const hall = this.halls()[hallId];
    if (!hall) return '';
    const cinema = this.cinemas()[hall.cinemaId];
    if (!cinema) return hall.name;
    return `${cinema.name} · ${hall.name}`;
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
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.bookingInProgress.set(true);
    this.bookingError.set('');
    const bookingData: CreateBookingDTO = {
      showtimeId: this.selectedShowtime()!.id,
      seatIds: this.selectedSeatsIds(),
      paymentMethod: this.paymentMethod(),
    };
    this.apiService.createBooking(bookingData).subscribe({
      next: () => {
        this.bookingInProgress.set(false);
        this.bookingSuccess.set(true);
        this.selectedSeatsIds.set([]);
        this.selectShowtime(this.selectedShowtime()!);
      },
      error: (err) => {
        this.bookingInProgress.set(false);
        this.bookingError.set(parseApiError(err, 'Booking failed. Please try again.'));
      },
    });
  }

  submitReview() {
    if (!this.reviewForm.valid || !this.movie()) return;
    if (!this.authService.currentUserToken()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
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
          this.fetchReviews(this.movie()!.id);
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
          this.fetchReviews(this.movie()!.id);
        },
        error: () => this.reviewMessage.set('Failed to update review.'),
      });
  }

  deleteReview(id: number) {
    if (!confirm('Delete this review?')) return;
    this.apiService.deleteReview(id).subscribe({
      next: () => this.fetchReviews(this.movie()!.id),
      error: () => this.reviewMessage.set('Failed to delete review.'),
    });
  }

  canManageReview(review: Review): boolean {
    if (!this.isLoggedIn()) return false;
    if (this.isAdmin()) return true;
    const userId = this.currentUserId();
    return !!userId && review.appUserId === userId;
  }
}
