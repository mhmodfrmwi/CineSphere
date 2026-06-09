export interface UpdateCinemaDTO {
  name: string;
  location: string;
}

export interface UpdateGenreDTO {
  name: string;
}

export interface UpdateHallDTO {
  name: string;
  capacity?: number;
  cinemaId?: number;
}

export interface UpdateMovieDTO {
  title: string;
  description?: string;
  durationInMinutes?: number;
  posterUrl?: string;
  language?: string;
  releaseDate?: string;
  trailerUrl?: string;
  genreIds?: number[];
}

export interface UpdateShowtimeDTO {
  startTime?: string;
  ticketPrice?: number;
  movieId?: number;
  hallId?: number;
}

export interface UpdateReviewDTO {
  rating?: number;
  comment?: string;
}
