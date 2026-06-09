export interface CreateMovieDTO {
  title: string;
  description?: string;
  durationInMinutes?: number;
  posterUrl?: string;
  language?: string;
  releaseDate?: string;
  trailerUrl?: string;
  genreIds?: number[];
}
