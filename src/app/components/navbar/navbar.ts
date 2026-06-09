import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
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
  private elementRef = inject(ElementRef);

  isLoggedIn = this.authService.isLoggedIn;
  isAdmin = this.authService.isAdmin;
  isMenuOpen = signal(false);
  isProfileOpen = signal(false);
  isCategoriesOpen = signal(false);
  isMobileCategoriesOpen = signal(false);
  genres = signal<Genre[]>([]);

  ngOnInit() {
    this.fetchGenres();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeAllDropdowns();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeAllDropdowns();
  }

  toggleMenu() {
    this.isMenuOpen.update((open) => !open);
    this.isCategoriesOpen.set(false);
    this.isProfileOpen.set(false);
  }

  toggleProfile() {
    this.isProfileOpen.update((open) => !open);
    this.isCategoriesOpen.set(false);
  }

  toggleCategories() {
    this.isCategoriesOpen.update((open) => !open);
    this.isProfileOpen.set(false);
  }

  toggleMobileCategories() {
    this.isMobileCategoriesOpen.update((open) => !open);
  }

  closeCategories() {
    this.isCategoriesOpen.set(false);
    this.isMobileCategoriesOpen.set(false);
  }

  closeAllDropdowns() {
    this.isCategoriesOpen.set(false);
    this.isProfileOpen.set(false);
    this.isMobileCategoriesOpen.set(false);
  }

  onGenreSelect() {
    this.closeCategories();
    this.isMenuOpen.set(false);
  }

  fetchGenres() {
    this.apiService.getAllGenres().subscribe({
      next: (data) => this.genres.set(data),
      error: (err) => console.error('Error fetching genres:', err),
    });
  }

  logout() {
    this.authService.logout();
    this.closeAllDropdowns();
    this.isMenuOpen.set(false);
  }
}
