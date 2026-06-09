import { Component, inject, OnInit, signal } from '@angular/core';
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

  cinema = signal<Cinema | null>(null);
  halls = signal<Hall[]>([]);
  loading = signal(true);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getCinemaById(id).subscribe({
      next: (data) => this.cinema.set(data),
      error: () => this.loading.set(false),
    });
    this.api.getHallsByCinemaId(id).subscribe({
      next: (data) => {
        this.halls.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
