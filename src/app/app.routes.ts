import { Routes } from '@angular/router';
import { MovieDetails } from './features/movie-details/movie-details';
import { Home } from './features/home/home';
import { Login } from './features/login/login';
import { Register } from './features/register/register';
import { authGuard } from './core/services/api/authService/authGuard';
import { adminGuard } from './core/services/api/authService/adminGuard';
import { UserBookings } from './features/user-bookings/user-bookings';
import { BookingDetail } from './features/booking-detail/booking-detail';
import { Cinemas } from './features/cinemas/cinemas';
import { CinemaDetail } from './features/cinemas/cinema-detail';
import { Admin } from './features/admin/admin';
import { Profile } from './features/profile/profile';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'movie/:id', component: MovieDetails },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'cinemas', component: Cinemas },
  { path: 'cinemas/:id', component: CinemaDetail },
  { path: 'bookings', canActivate: [authGuard], component: UserBookings },
  { path: 'bookings/:id', canActivate: [authGuard], component: BookingDetail },
  { path: 'profile', canActivate: [authGuard], component: Profile },
  { path: 'admin', canActivate: [adminGuard], component: Admin },
];
