export interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateReviewDTO {
  movieId: number;
  rating: number;
  comment: string;
}
