import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { tokenHasAdminRole } from './jwt-utils';
import { LoginDTO } from '../../../models/LoginDTO';
import { LoginResponseDTO } from '../../../models/LoginResponseDTO';
import { RegisterDTO } from '../../../models/RegisterDTO';
import { UpdateUserProfileDTO, UserProfile } from '../../../models/UserProfile';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:7262/api/auth';
  currentUserToken = signal<string | null>(localStorage.getItem('token'));
  isLoggedIn = computed(() => !!this.currentUserToken());
  isAdmin = computed(() => tokenHasAdminRole(this.currentUserToken()));
  login(loginData: LoginDTO) {
    return this.http.post<LoginResponseDTO>(`${this.baseUrl}/login`, loginData).pipe(
      tap((response) => {
        if (response.isAuthenticated) {
          this.currentUserToken.set(response.token);
          localStorage.setItem('token', response.token);
        } else {
          this.currentUserToken.set(null);
          localStorage.removeItem('token');
        }
      }),
    );
  }

  register(registerData: RegisterDTO) {
    return this.http.post(`${this.baseUrl}/register`, registerData);
  }

  getProfile() {
    return this.http.get<UserProfile>(`${this.baseUrl}/profile`);
  }

  updateProfile(data: UpdateUserProfileDTO) {
    return this.http.put(`${this.baseUrl}/profile`, data);
  }

  logout() {
    this.currentUserToken.set(null);
    localStorage.removeItem('token');
  }
}
