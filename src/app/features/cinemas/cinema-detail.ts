import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Api } from '../../core/services/api/apiService/api';
import { Cinema } from '../../core/models/Cinema';
import { Hall } from '../../core/models/Hall';

@Component({
  selector: 'app-cinema-detail',
  imports: [RouterLink],
  templateUrl: './cinema-detail.html',
  styleUrl: './cinema-detail.css',
})
export class CinemaDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(Api);
  private destroyRef = inject(DestroyRef);

  cinema = signal<Cinema | null>(null);
  halls = signal<Hall[]>([]);
  loading = signal(true);
  error = signal(false);

  ngOnInit() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = Number(params.get('id'));
      if (!id || Number.isNaN(id)) {
        this.error.set(true);
        this.loading.set(false);
        return;
      }
      this.loadCinema(id);
    });
  }

  private loadCinema(id: number) {
    this.loading.set(true);
    this.error.set(false);
    this.api.getCinemaById(id).subscribe({
      next: (data) => this.cinema.set(data),
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
    this.api.getHallsByCinemaId(id).subscribe({
      next: (data) => {
        this.halls.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
