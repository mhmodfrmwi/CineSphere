import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Movie, PaginatedMovies } from '../../../models/movie';
import { Showtime } from '../../../models/showtime';
import { Seat } from '../../../models/Seat';
import { CreateBookingDTO } from '../../../models/CreateBookingDTO';
import { BookingDTO } from '../../../models/BookingDTO';
import { Genre } from '../../../models/Genre';
import { Cinema, CreateCinemaDTO } from '../../../models/Cinema';
import { Hall, CreateHallDTO } from '../../../models/Hall';
import { Review, CreateReviewDTO } from '../../../models/Review';
import { DashboardStats } from '../../../models/Dashboard';
import { CreateMovieDTO } from '../../../models/CreateMovieDTO';
import { CreateShowtimeDTO } from '../../../models/CreateShowtimeDTO';
import { GenerateSeatsDTO } from '../../../models/GenerateSeatsDTO';
import {
  UpdateCinemaDTO,
  UpdateGenreDTO,
  UpdateHallDTO,
  UpdateMovieDTO,
  UpdateReviewDTO,
  UpdateShowtimeDTO,
} from '../../../models/UpdateDtos';

export interface MoviesQueryParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  genre?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Api {
  private baseUrl = 'https://localhost:7262/api';
  private http = inject(HttpClient);

  getMovies(params?: MoviesQueryParams) {
    let httpParams = new HttpParams();
    if (params?.pageIndex != null) httpParams = httpParams.set('PageIndex', params.pageIndex);
    if (params?.pageSize != null) httpParams = httpParams.set('PageSize', params.pageSize);
    if (params?.search) httpParams = httpParams.set('Search', params.search);
    if (params?.genre) httpParams = httpParams.set('Genre', params.genre);
    return this.http.get<PaginatedMovies>(`${this.baseUrl}/movies`, { params: httpParams });
  }

  getMovieById(id: number) {
    return this.http.get<Movie>(`${this.baseUrl}/movies/${id}`);
  }

  createMovie(data: CreateMovieDTO) {
    return this.http.post<Movie>(`${this.baseUrl}/movies`, data);
  }

  updateMovie(id: number, data: UpdateMovieDTO) {
    return this.http.put<Movie>(`${this.baseUrl}/movies/${id}`, data);
  }

  deleteMovie(id: number) {
    return this.http.delete(`${this.baseUrl}/movies/${id}`);
  }

  uploadPoster(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<string>(`${this.baseUrl}/movies/upload-poster`, formData);
  }

  getShowtimesByMovieId(movieId: number) {
    return this.http.get<Showtime[]>(`${this.baseUrl}/showtimes/movie/${movieId}`);
  }

  getShowtimeById(id: number) {
    return this.http.get<Showtime>(`${this.baseUrl}/showtimes/${id}`);
  }

  createShowtime(data: CreateShowtimeDTO) {
    return this.http.post<Showtime>(`${this.baseUrl}/showtimes`, data);
  }

  updateShowtime(id: number, data: UpdateShowtimeDTO) {
    return this.http.put<Showtime>(`${this.baseUrl}/showtimes/${id}`, data);
  }

  deleteShowtime(id: number) {
    return this.http.delete(`${this.baseUrl}/showtimes/${id}`);
  }

  getSeatsByShowtimeId(showtimeId: number) {
    return this.http.get<Seat[]>(`${this.baseUrl}/seats/showtime/${showtimeId}`);
  }

  getSeatsByHallId(hallId: number) {
    return this.http.get<Seat[]>(`${this.baseUrl}/seats/hall/${hallId}`);
  }

  generateSeats(data: GenerateSeatsDTO) {
    return this.http.post(`${this.baseUrl}/seats/generate`, data);
  }

  createBooking(bookingData: CreateBookingDTO) {
    return this.http.post(`${this.baseUrl}/bookings`, bookingData);
  }

  getBookingById(id: number) {
    return this.http.get<BookingDTO>(`${this.baseUrl}/bookings/${id}`);
  }

  cancelBooking(id: number) {
    return this.http.put(`${this.baseUrl}/bookings/${id}/cancel`, {});
  }

  getUserBookings() {
    return this.http.get<BookingDTO[]>(`${this.baseUrl}/bookings/my-bookings`);
  }

  getAllGenres() {
    return this.http.get<Genre[]>(`${this.baseUrl}/Genre`);
  }

  getGenreById(id: number) {
    return this.http.get<Genre>(`${this.baseUrl}/Genre/${id}`);
  }

  createGenre(name: string) {
    return this.http.post(`${this.baseUrl}/Genre`, { name });
  }

  updateGenre(id: number, data: UpdateGenreDTO) {
    return this.http.put(`${this.baseUrl}/Genre/${id}`, data);
  }

  deleteGenre(id: number) {
    return this.http.delete(`${this.baseUrl}/Genre/${id}`);
  }

  getReviewsByMovieId(movieId: number) {
    return this.http.get<Review[]>(`${this.baseUrl}/reviews/movie/${movieId}`);
  }

  createReview(data: CreateReviewDTO) {
    return this.http.post(`${this.baseUrl}/reviews`, data);
  }

  updateReview(id: number, data: UpdateReviewDTO) {
    return this.http.put(`${this.baseUrl}/reviews/${id}`, data);
  }

  deleteReview(id: number) {
    return this.http.delete(`${this.baseUrl}/reviews/${id}`);
  }

  getCinemas() {
    return this.http.get<Cinema[]>(`${this.baseUrl}/cinemas`);
  }

  getCinemaById(id: number) {
    return this.http.get<Cinema>(`${this.baseUrl}/cinemas/${id}`);
  }

  createCinema(data: CreateCinemaDTO) {
    return this.http.post<Cinema>(`${this.baseUrl}/cinemas`, data);
  }

  updateCinema(id: number, data: UpdateCinemaDTO) {
    return this.http.put<Cinema>(`${this.baseUrl}/cinemas/${id}`, data);
  }

  deleteCinema(id: number) {
    return this.http.delete(`${this.baseUrl}/cinemas/${id}`);
  }

  getHallsByCinemaId(cinemaId: number) {
    return this.http.get<Hall[]>(`${this.baseUrl}/halls/cinema/${cinemaId}`);
  }

  getHallById(id: number) {
    return this.http.get<Hall>(`${this.baseUrl}/halls/${id}`);
  }

  createHall(data: CreateHallDTO) {
    return this.http.post<Hall>(`${this.baseUrl}/halls`, data);
  }

  updateHall(id: number, data: UpdateHallDTO) {
    return this.http.put<Hall>(`${this.baseUrl}/halls/${id}`, data);
  }

  deleteHall(id: number) {
    return this.http.delete(`${this.baseUrl}/halls/${id}`);
  }

  getDashboardStats() {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard/stats`);
  }
}
