import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/api/authService/auth-service';
import { RegisterDTO } from '../../core/models/RegisterDTO';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = '';
  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
  });

  onSubmit() {
    if (!this.registerForm.valid) return;
    this.errorMessage = '';
    const data = this.registerForm.value as RegisterDTO;
    this.authService.register(data).subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => (this.errorMessage = 'Registration failed. Please try again.'),
    });
  }
}
