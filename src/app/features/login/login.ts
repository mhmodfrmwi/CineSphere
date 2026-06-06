import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/api/authService/auth-service';
import { LoginDTO } from '../../core/models/LoginDTO';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  onSubmit() {
    if (!this.loginForm.valid) {
      return;
    }
    const loginData = this.loginForm.value as LoginDTO;
    this.authService.login(loginData).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Login failed:', err);
      },
    });
  }
}
