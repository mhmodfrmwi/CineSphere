import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth-service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const token = authService.currentUserToken();
  const router = inject(Router);
  if (!token) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
