import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { Api } from '../../core/services/api/apiService/api';
import { AuthService } from '../../core/services/api/authService/auth-service';
import { Movie } from '../../core/models/movie';
import { Genre } from '../../core/models/Genre';
import { AssetUrlPipe } from '../../core/pipes/asset-url-pipe';
import { SafeUrlPipe } from '../../core/pipes/safe-url-pipe';

type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'duration';

@Component({
  selector: 'app-home',
  imports: [RouterLink, DatePipe, AssetUrlPipe, SafeUrlPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private apiService = inject(Api);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isLoggedIn = this.authService.isLoggedIn;
  private destroyRef = inject(DestroyRef);
  private searchSubject = new Subject<string>();

  searchText = signal('');
  selectedGenre = signal<string | null>(null);
  sortBy = signal<SortOption>('newest');
  pageIndex = signal(1);
  pageSize = signal(12);
  totalCount = signal(0);

  movies = signal<Movie[]>([]);
  genres = signal<Genre[]>([]);
  loading = signal(true);
  error = signal(false);

  readonly sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title-asc', label: 'Title A–Z' },
    { value: 'title-desc', label: 'Title Z–A' },
    { value: 'duration', label: 'Longest Runtime' },
  ];

  featuredMovie = computed(() => {
    const list = this.movies();
    if (!list.length) return null;
    return [...list].sort(
      (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime(),
    )[0];
  });

  newReleases = computed(() =>
    [...this.movies()]
      .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
      .slice(0, 10),
  );

  trendingMovies = computed(() => this.newReleases().slice(0, 8));

  sortedMovies = computed(() => {
    const list = [...this.movies()];
    const sort = this.sortBy();
    switch (sort) {
      case 'newest':
        return list.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
      case 'oldest':
        return list.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
      case 'title-asc':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return list.sort((a, b) => b.title.localeCompare(a.title));
      case 'duration':
        return list.sort((a, b) => b.durationInMinutes - a.durationInMinutes);
      default:
        return list;
    }
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize())));

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.pageIndex();
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  hasActiveFilters = computed(
    () => !!this.selectedGenre() || !!this.searchText().trim() || this.sortBy() !== 'newest',
  );

  ngOnInit() {
    this.searchSubject
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((term) => {
        this.searchText.set(term);
        this.pageIndex.set(1);
        this.fetchMovies();
      });

    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.selectedGenre.set(params['genre'] ?? null);
      this.pageIndex.set(1);
      this.fetchMovies();
    });

    this.apiService.getAllGenres().subscribe({
      next: (data) => this.genres.set(data),
    });
  }

  fetchMovies() {
    this.loading.set(true);
    this.error.set(false);
    const genre = this.selectedGenre();
    this.apiService
      .getMovies({
        pageIndex: this.pageIndex(),
        pageSize: this.pageSize(),
        search: this.searchText().trim() || undefined,
        genre: genre ?? undefined,
      })
      .subscribe({
        next: (data) => {
          this.movies.set(data.data ?? []);
          this.totalCount.set(data.count);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }

  onSearchInput(value: string) {
    this.searchText.set(value);
    this.searchSubject.next(value);
  }

  selectGenre(genre: string | null) {
    if (genre) {
      this.router.navigate(['/'], { queryParams: { genre } });
    } else {
      this.router.navigate(['/']);
    }
  }

  onSortChange(value: string) {
    this.sortBy.set(value as SortOption);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.pageIndex.set(page);
    this.fetchMovies();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearFilters() {
    this.searchText.set('');
    this.sortBy.set('newest');
    this.pageIndex.set(1);
    this.router.navigate(['/']);
  }

  genreName(genre: string): string {
    return this.genres().find((g) => g.name === genre)?.name ?? genre;
  }

  formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
}
