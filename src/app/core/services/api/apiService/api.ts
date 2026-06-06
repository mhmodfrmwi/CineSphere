import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Movie, PaginatedMovies } from '../../../models/movie';
import { Showtime } from '../../../models/showtime';
import { Seat } from '../../../models/Seat';
import { CreateBookingDTO } from '../../../models/CreateBookingDTO';
import { BookingDTO } from '../../../models/BookingDTO';
import { Genre } from '../../../models/Genre';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private baseUrl = 'https://localhost:7262/api';
  private http = inject(HttpClient);
  getMovies() {
    return this.http.get<PaginatedMovies>(`${this.baseUrl}/movies`);
  }
  getMovieById(id: number) {
    return this.http.get<Movie>(`${this.baseUrl}/movies/${id}`);
  }
  getShowtimesByMovieId(movieId: number) {
    return this.http.get<Showtime[]>(`${this.baseUrl}/showtimes/movie/${movieId}`);
  }
  getSeatsByShowtimeId(showtimeId: number) {
    return this.http.get<Seat[]>(`${this.baseUrl}/seats/showtime/${showtimeId}`);
  }
  createBooking(bookingData: CreateBookingDTO) {
    return this.http.post(`${this.baseUrl}/bookings`, bookingData);
  }
  getUserBookings() {
    return this.http.get<BookingDTO[]>(`${this.baseUrl}/bookings/my-bookings`);
  }
  getAllGenres() {
    return this.http.get<Genre[]>(`${this.baseUrl}/Genre`);
  }
}
