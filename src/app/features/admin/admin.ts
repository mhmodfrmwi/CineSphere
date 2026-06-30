import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { Api } from '../../core/services/api/apiService/api';
import { DashboardStats } from '../../core/models/Dashboard';
import { Cinema } from '../../core/models/Cinema';
import { Hall } from '../../core/models/Hall';
import { Movie } from '../../core/models/movie';
import { Genre } from '../../core/models/Genre';
import { Showtime } from '../../core/models/showtime';

type AdminTab = 'dashboard' | 'cinemas' | 'halls' | 'movies' | 'showtimes' | 'genres' | 'seats';

@Component({
  selector: 'app-admin',
  imports: [ReactiveFormsModule, DecimalPipe, TitleCasePipe],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  private api = inject(Api);

  activeTab = signal<AdminTab>('dashboard');
  message = signal('');
  error = signal('');

  stats = signal<DashboardStats | null>(null);
  cinemas = signal<Cinema[]>([]);
  halls = signal<Hall[]>([]);
  movies = signal<Movie[]>([]);
  genres = signal<Genre[]>([]);
  showtimes = signal<Showtime[]>([]);
  hallSeats = signal<{ id: number; seatNumber: string; isAvailable: boolean }[]>([]);

  editingCinemaId = signal<number | null>(null);
  editingGenreId = signal<number | null>(null);
  editingMovieId = signal<number | null>(null);
  editingHallId = signal<number | null>(null);
  editingShowtimeId = signal<number | null>(null);

  cinemaForm = new FormGroup({
    name: new FormControl('', Validators.required),
    location: new FormControl('', Validators.required),
  });

  hallForm = new FormGroup({
    name: new FormControl('', Validators.required),
    capacity: new FormControl(50, [Validators.required, Validators.min(1)]),
    cinemaId: new FormControl(0, [Validators.required, Validators.min(1)]),
  });

  movieForm = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl(''),
    durationInMinutes: new FormControl(120, Validators.required),
    posterUrl: new FormControl(''),
    language: new FormControl('English', Validators.required),
    releaseDate: new FormControl('', Validators.required),
    trailerUrl: new FormControl(''),
    genreIds: new FormControl(''),
  });

  showtimeForm = new FormGroup({
    startTime: new FormControl('', Validators.required),
    ticketPrice: new FormControl(100, Validators.required),
    movieId: new FormControl(0, [Validators.required, Validators.min(1)]),
    hallId: new FormControl(0, [Validators.required, Validators.min(1)]),
  });

  genreForm = new FormGroup({
    name: new FormControl('', Validators.required),
  });

  seatsForm = new FormGroup({
    hallId: new FormControl(0, [Validators.required, Validators.min(1)]),
    capacity: new FormControl(50, [Validators.required, Validators.min(1)]),
  });

  viewHallId = new FormControl(0);
  posterFile: File | null = null;

  ngOnInit() {
    this.loadReferenceData();
    this.loadDashboard();
  }

  setTab(tab: AdminTab) {
    this.activeTab.set(tab);
    this.message.set('');
    this.error.set('');
    this.clearEdits();
    if (tab === 'dashboard') this.loadDashboard();
    if (tab === 'halls') this.loadHalls();
    if (tab === 'showtimes' || tab === 'seats') this.loadAllHalls();
    if (tab === 'movies' || tab === 'showtimes') this.loadAllMovies(tab === 'showtimes');
  }

  private clearEdits() {
    this.editingCinemaId.set(null);
    this.editingGenreId.set(null);
    this.editingMovieId.set(null);
    this.editingHallId.set(null);
    this.editingShowtimeId.set(null);
  }

  private loadReferenceData() {
    this.api.getCinemas().subscribe({ next: (d) => this.cinemas.set(d) });
    this.loadAllMovies();
    this.api.getAllGenres().subscribe({ next: (d) => this.genres.set(d) });
  }

  private loadAllMovies(reloadShowtimes = false) {
    this.api.getAllMoviesList().subscribe({
      next: (d) => {
        this.movies.set(d);
        if (reloadShowtimes) this.loadAllShowtimes();
      },
      error: () => this.error.set('Failed to load movies. Is the API running?'),
    });
  }

  private loadDashboard() {
    this.api.getDashboardStats().subscribe({
      next: (d) => this.stats.set(d),
      error: () => this.error.set('Failed to load dashboard stats.'),
    });
  }

  private loadHalls() {
    const cinemaId = this.hallForm.value.cinemaId;
    if (cinemaId) {
      this.api.getHallsByCinemaId(cinemaId).subscribe({ next: (d) => this.halls.set(d) });
    }
  }

  private loadAllHalls() {
    this.api.getCinemas().subscribe((cinemas) => {
      if (!cinemas.length) {
        this.halls.set([]);
        return;
      }
      let pending = cinemas.length;
      const all: Hall[] = [];
      cinemas.forEach((c) => {
        this.api.getHallsByCinemaId(c.id).subscribe((h) => {
          all.push(...h);
          pending--;
          if (pending === 0) this.halls.set([...all]);
        });
      });
    });
  }

  private loadAllShowtimes() {
    const all: Showtime[] = [];
    let pending = this.movies().length || 1;
    if (!this.movies().length) {
      this.showtimes.set([]);
      return;
    }
    this.movies().forEach((m) => {
      this.api.getShowtimesByMovieId(m.id).subscribe((st) => {
        all.push(...st);
        pending--;
        if (pending === 0) this.showtimes.set([...all]);
      });
    });
  }

  onCinemaChange() {
    this.loadHalls();
  }

  private parseGenreIds(value: string | null | undefined): number[] {
    if (!value?.trim()) return [];
    return value.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n));
  }

  submitCinema() {
    if (!this.cinemaForm.valid) return;
    const data = this.cinemaForm.value as { name: string; location: string };
    const editId = this.editingCinemaId();
    const req = editId ? this.api.updateCinema(editId, data) : this.api.createCinema(data);
    req.subscribe({
      next: () => {
        this.message.set(editId ? 'Cinema updated.' : 'Cinema created.');
        this.cinemaForm.reset();
        this.editingCinemaId.set(null);
        this.api.getCinemas().subscribe({ next: (d) => this.cinemas.set(d) });
      },
      error: () => this.error.set('Cinema operation failed.'),
    });
  }

  editCinema(c: Cinema) {
    this.editingCinemaId.set(c.id);
    this.cinemaForm.patchValue({ name: c.name, location: c.location });
  }

  deleteCinema(id: number) {
    if (!confirm('Delete this cinema? This cannot be undone.')) return;
    this.api.deleteCinema(id).subscribe({
      next: () => {
        this.message.set('Cinema deleted.');
        this.api.getCinemas().subscribe({ next: (d) => this.cinemas.set(d) });
      },
      error: () => this.error.set('Failed to delete cinema.'),
    });
  }

  submitHall() {
    if (!this.hallForm.valid) return;
    const data = this.hallForm.value as { name: string; capacity: number; cinemaId: number };
    const editId = this.editingHallId();
    const req = editId
      ? this.api.updateHall(editId, { name: data.name, capacity: data.capacity, cinemaId: data.cinemaId })
      : this.api.createHall(data);
    req.subscribe({
      next: () => {
        this.message.set(editId ? 'Hall updated.' : 'Hall created.');
        this.editingHallId.set(null);
        this.loadHalls();
      },
      error: () => this.error.set('Hall operation failed.'),
    });
  }

  editHall(h: Hall) {
    this.editingHallId.set(h.id);
    this.hallForm.patchValue({ name: h.name, capacity: h.capacity, cinemaId: h.cinemaId });
  }

  deleteHall(id: number) {
    if (!confirm('Delete this hall? This cannot be undone.')) return;
    this.api.deleteHall(id).subscribe({
      next: () => {
        this.message.set('Hall deleted.');
        this.loadHalls();
      },
      error: () => this.error.set('Failed to delete hall.'),
    });
  }

  onPosterSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.posterFile = input.files?.[0] ?? null;
  }

  submitMovie() {
    if (!this.movieForm.valid) return;
    const raw = this.movieForm.value;
    const genreIds = this.parseGenreIds(raw.genreIds);
    const buildPayload = (posterUrl?: string) => ({
      title: raw.title!,
      description: raw.description || undefined,
      durationInMinutes: raw.durationInMinutes ?? undefined,
      posterUrl: posterUrl ?? raw.posterUrl ?? undefined,
      language: raw.language || undefined,
      releaseDate: raw.releaseDate ? new Date(raw.releaseDate).toISOString() : undefined,
      trailerUrl: raw.trailerUrl || undefined,
      genreIds,
    });

    const editId = this.editingMovieId();
    const req = editId
      ? this.api.updateMovie(editId, buildPayload())
      : this.api.createMovie(buildPayload());

    req.subscribe({
      next: (movie) => {
        const movieId = editId ?? movie.id;
        const finish = (posterMessage?: string) => {
          this.message.set(
            posterMessage ?? (editId ? 'Movie updated.' : `Movie "${movie.title}" created.`),
          );
          this.resetMovieForm();
          this.loadAllMovies();
        };

        if (this.posterFile) {
          this.api.uploadPoster(this.posterFile).subscribe({
            next: (upload) => {
              const posterUrl = upload.posterUrl;
              this.api.updateMovie(movieId, buildPayload(posterUrl)).subscribe({
                next: () => finish(editId ? 'Movie updated with new poster.' : 'Movie created with poster.'),
                error: () => finish('Movie saved but poster URL update failed.'),
              });
            },
            error: () => finish('Movie saved but poster upload failed.'),
          });
        } else {
          finish();
        }
      },
      error: () => this.error.set('Movie operation failed.'),
    });
  }

  editMovie(m: Movie) {
    this.editingMovieId.set(m.id);
    this.movieForm.patchValue({
      title: m.title,
      description: m.description,
      durationInMinutes: m.durationInMinutes,
      posterUrl: m.posterUrl,
      language: m.language,
      releaseDate: m.releaseDate?.split('T')[0] ?? '',
      trailerUrl: m.trailerUrl,
    });
  }

  deleteMovie(id: number) {
    if (!confirm('Delete this movie? This cannot be undone.')) return;
    this.api.deleteMovie(id).subscribe({
      next: () => {
        this.message.set('Movie deleted.');
        this.loadAllMovies();
      },
      error: () => this.error.set('Failed to delete movie.'),
    });
  }

  private resetMovieForm() {
    this.movieForm.reset({ durationInMinutes: 120, language: 'English' });
    this.editingMovieId.set(null);
    this.posterFile = null;
  }

  submitShowtime() {
    if (!this.showtimeForm.valid) return;
    const raw = this.showtimeForm.value;
    const data = {
      startTime: new Date(raw.startTime!).toISOString(),
      ticketPrice: raw.ticketPrice!,
      movieId: raw.movieId!,
      hallId: raw.hallId!,
    };
    const editId = this.editingShowtimeId();
    const req = editId ? this.api.updateShowtime(editId, data) : this.api.createShowtime(data);
    req.subscribe({
      next: () => {
        this.message.set(editId ? 'Showtime updated.' : 'Showtime created.');
        this.showtimeForm.reset({ ticketPrice: 100 });
        this.editingShowtimeId.set(null);
        this.loadAllShowtimes();
      },
      error: () => this.error.set('Showtime operation failed.'),
    });
  }

  editShowtime(st: Showtime) {
    this.editingShowtimeId.set(st.id);
    const local = new Date(st.startTime);
    const pad = (n: number) => String(n).padStart(2, '0');
    const datetime = `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}T${pad(local.getHours())}:${pad(local.getMinutes())}`;
    this.showtimeForm.patchValue({
      startTime: datetime,
      ticketPrice: st.ticketPrice,
      movieId: st.movieId,
      hallId: st.hallId,
    });
  }

  deleteShowtime(id: number) {
    if (!confirm('Delete this showtime? This cannot be undone.')) return;
    this.api.deleteShowtime(id).subscribe({
      next: () => {
        this.message.set('Showtime deleted.');
        this.loadAllShowtimes();
      },
      error: () => this.error.set('Failed to delete showtime.'),
    });
  }

  submitGenre() {
    if (!this.genreForm.valid) return;
    const name = this.genreForm.value.name!;
    const editId = this.editingGenreId();
    const req = editId ? this.api.updateGenre(editId, { name }) : this.api.createGenre(name);
    req.subscribe({
      next: () => {
        this.message.set(editId ? 'Genre updated.' : 'Genre created.');
        this.genreForm.reset();
        this.editingGenreId.set(null);
        this.api.getAllGenres().subscribe({ next: (d) => this.genres.set(d) });
      },
      error: () => this.error.set('Genre operation failed.'),
    });
  }

  editGenre(g: Genre) {
    this.editingGenreId.set(g.id);
    this.genreForm.patchValue({ name: g.name });
  }

  deleteGenre(id: number) {
    if (!confirm('Delete this genre? This cannot be undone.')) return;
    this.api.deleteGenre(id).subscribe({
      next: () => {
        this.message.set('Genre deleted.');
        this.api.getAllGenres().subscribe({ next: (d) => this.genres.set(d) });
      },
      error: () => this.error.set('Failed to delete genre.'),
    });
  }

  generateSeats() {
    if (!this.seatsForm.valid) return;
    this.api.generateSeats(this.seatsForm.value as { hallId: number; capacity: number }).subscribe({
      next: () => {
        this.message.set('Seats generated.');
        this.viewHallSeats();
      },
      error: () => this.error.set('Failed to generate seats.'),
    });
  }

  viewHallSeats() {
    const hallId = this.viewHallId.value;
    if (!hallId) return;
    this.api.getSeatsByHallId(hallId).subscribe({
      next: (seats) => this.hallSeats.set(seats),
      error: () => this.error.set('Failed to load hall seats.'),
    });
  }
}
