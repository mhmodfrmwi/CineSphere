import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/api/authService/auth-service';
import { UserProfile } from '../../core/models/UserProfile';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private authService = inject(AuthService);

  profile = signal<UserProfile | null>(null);
  message = signal('');
  error = signal('');
  loading = signal(true);

  profileForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
  });

  ngOnInit() {
    this.loadProfile();
  }

  private loadProfile() {
    this.authService.getProfile().subscribe({
      next: (data) => {
        this.profile.set(data);
        this.profileForm.patchValue({ firstName: data.firstName, lastName: data.lastName });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load profile.');
        this.loading.set(false);
      },
    });
  }

  onSubmit() {
    if (!this.profileForm.valid) return;
    this.message.set('');
    this.error.set('');
    this.authService.updateProfile(this.profileForm.value as { firstName: string; lastName: string }).subscribe({
      next: () => {
        this.message.set('Profile updated successfully.');
        this.loadProfile();
      },
      error: () => this.error.set('Failed to update profile.'),
    });
  }
}
