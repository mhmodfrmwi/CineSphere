import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { LoginDTO } from '../../../models/LoginDTO';
import { LoginResponseDTO } from '../../../models/LoginResponseDTO';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:7262/api/auth';
  currentUserToken = signal<string | null>(localStorage.getItem('token'));
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

  register(registerData: { email: string; password: string }) {
    return this.http.post(`${this.baseUrl}/register`, registerData);
  }

  logout() {
    this.currentUserToken.set(null);
    localStorage.removeItem('token');
  }
}
