import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api } from '../../core/services/api/apiService/api';
import { Cinema } from '../../core/models/Cinema';

@Component({
  selector: 'app-cinemas',
  imports: [RouterLink],
  templateUrl: './cinemas.html',
  styleUrl: './cinemas.css',
})
export class Cinemas implements OnInit {
  private api = inject(Api);
  cinemas = signal<Cinema[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.api.getCinemas().subscribe({
      next: (data) => {
        this.cinemas.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
