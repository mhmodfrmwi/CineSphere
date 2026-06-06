import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/api/authService/auth-service';
import { Genre } from '../../core/models/Genre';
import { Api } from '../../core/services/api/apiService/api';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private authService = inject(AuthService);
  private apiService = inject(Api);
  isLoggedIn = computed(() => !!this.authService.currentUserToken());
  isMenuOpen = signal(false);
  isProfileOpen = signal(false);
  genres = signal<Genre[]>([]);

  ngOnInit() {
    this.fetchGenres();
  }
  toggleMenu() {
    this.isMenuOpen.update((open) => !open);
  }
  toggleProfile() {
    this.isProfileOpen.update((open) => !open);
  }
  fetchGenres() {
    this.apiService.getAllGenres().subscribe({
      next: (data) => {
        this.genres.set(data);
        console.log('Genres fetched successfully:', data);
      },
      error: (err) => {
        console.error('Error fetching genres:', err);
      },
    });
  }
  logout() {
    this.authService.logout();
  }
}
