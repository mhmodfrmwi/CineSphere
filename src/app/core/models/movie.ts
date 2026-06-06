export interface Movie {
  id: number;
  title: string;
  description: string;
  releaseDate: string;
  durationInMinutes: number;
  language: string;
  posterUrl: string;
  trailerUrl: string;
}
export interface PaginatedMovies {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: Movie[];
}
