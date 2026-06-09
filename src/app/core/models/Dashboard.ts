export interface DashboardStats {
  totalMovies: number;
  totalUsers: number;
  totalTicketsSold: number;
  totalRevenue: number;
  occupancyRatePercentage: number;
  topMovies: TopMovie[];
  recentBookings: RecentBooking[];
  revenueLast7Days: DailyRevenue[];
  topGenres: TopGenre[];
}

export interface TopMovie {
  movieName: string;
  ticketsSold: number;
}

export interface RecentBooking {
  bookingId: number;
  totalPrice: number;
  date: string;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
}

export interface TopGenre {
  genreName: string;
  count: number;
}
