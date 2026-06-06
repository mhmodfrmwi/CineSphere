import { Component, inject, OnInit, signal } from '@angular/core';
import { Api } from '../../core/services/api/apiService/api';
import { BookingDTO } from '../../core/models/BookingDTO';

@Component({
  selector: 'app-user-bookings',
  imports: [],
  templateUrl: './user-bookings.html',
  styleUrl: './user-bookings.css',
})
export class UserBookings implements OnInit {
  private apiService = inject(Api);
  bookings = signal<BookingDTO[]>([]);

  ngOnInit() {
    this.fetchUserBookings();
  }
  fetchUserBookings() {
    this.apiService.getUserBookings().subscribe({
      next: (data) => {
        this.bookings.set(data);
        console.log('User bookings fetched successfully:', data);
      },
      error: (err) => {
        console.error('Error fetching user bookings:', err);
      },
    });
  }
}
