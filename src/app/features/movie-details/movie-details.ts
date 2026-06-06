import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Api } from '../../core/services/api/apiService/api';
import { Movie } from '../../core/models/movie';
import { Showtime } from '../../core/models/showtime';
import { DatePipe } from '@angular/common';
import { Seat } from '../../core/models/Seat';
import { CreateBookingDTO } from '../../core/models/CreateBookingDTO';
import { AuthService } from '../../core/services/api/authService/auth-service';

@Component({
  selector: 'app-movie-details',
  imports: [DatePipe],
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
  selectedShowtime = signal<Showtime | null>(null);
  seats = signal<Seat[]>([]);
  selectedSeatsIds = signal<number[]>([]);
  bookingData = signal<CreateBookingDTO>({
    showtimeId: 0,
    seatIds: [],
  });
  constructor() {
    effect(() => {
      const showtime = this.selectedShowtime();
      if (showtime) {
        this.apiService.getSeatsByShowtimeId(showtime.id).subscribe({
          next: (data) => {
            this.seats.set(data);
            console.log('Seats fetched successfully:', data);
          },
          error: (err) => {
            console.error('Error fetching seats:', err);
          },
        });
      } else {
        this.seats.set([]);
      }
    });
  }
  ngOnInit() {
    this.fetchMovieDetails();
    this.fetchShowtimes();
  }
  fetchMovieDetails() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.apiService.getMovieById(id).subscribe({
      next: (data) => {
        this.movie.set(data);
        console.log('Movie details fetched successfully:', data);
      },
      error: (err) => {
        console.error('Error fetching movie details:', err);
      },
    });
  }
  fetchShowtimes() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.apiService.getShowtimesByMovieId(id).subscribe({
      next: (data) => {
        this.showtimes.set(data);
        console.log('Show times fetched successfully:', data);
      },
      error: (err) => {
        console.error('Error fetching show times:', err);
      },
    });
  }
  reserveSeat(seatId: number) {
    const seat = this.seats().find((s) => s.id === seatId);
    if (seat) {
      if (this.selectedSeatsIds().includes(seat.id)) {
        this.selectedSeatsIds.update((ids) => ids.filter((id) => id !== seat.id));
      } else {
        this.selectedSeatsIds.update((ids) => [...ids, seat.id]);
      }
      console.log('Selected seat IDs:', this.selectedSeatsIds());
      return;
    }
  }
  createBooking() {
    if (!this.selectedShowtime()) {
      console.error('No showtime selected');
      return;
    }
    if (this.selectedSeatsIds().length === 0) {
      console.error('No seats selected');
      return;
    }
    if (!this.authService.currentUserToken()) {
      console.error('User not authenticated');
      this.router.navigate(['/login']);
      return;
    }
    this.bookingData.set({
      showtimeId: this.selectedShowtime()!.id,
      seatIds: this.selectedSeatsIds(),
    });
    this.apiService.createBooking(this.bookingData()).subscribe({
      next: (response) => {
        console.log('Booking created successfully:', response);
      },
      error: (err) => {
        console.error('Error creating booking:', err);
      },
    });
  }
}
