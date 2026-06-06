import { Routes } from '@angular/router';
import { MovieDetails } from './features/movie-details/movie-details';
import { Home } from './features/home/home';
import { Login } from './features/login/login';
import { authGuard } from './core/services/api/authService/authGuard';
import { UserBookings } from './features/user-bookings/user-bookings';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'movie/:id',
    component: MovieDetails,
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'bookings',
    canActivate: [authGuard],
    component: UserBookings,
  },
];
