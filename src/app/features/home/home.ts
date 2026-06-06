import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Api } from '../../core/services/api/apiService/api';
import { Movie } from '../../core/models/movie';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/api/authService/auth-service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private apiService = inject(Api);
  
  searchText = signal('');
  movies = signal<Movie[]>([]);
  ngOnInit() {
    this.fetchMovies();
  }
  filteredMovies = computed(() => {
    const searchText = this.searchText().toLowerCase();
    return this.movies().filter((movie) => movie.title.toLowerCase().includes(searchText));
  });
  fetchMovies() {
    this.apiService.getMovies().subscribe({
      next: (data) => {
        this.movies.set(data.data);
        console.log('Movies fetched successfully:', data);
      },
      error: (err) => {
        console.error('Error fetching movies:', err);
      },
    });
  }
  
}
