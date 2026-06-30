import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/api/authService/auth-service';
import { parseApiError, sanitizeReturnUrl } from '../../core/utils/api-error';
import { LoginDTO } from '../../core/models/LoginDTO';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  errorMessage = '';
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  onSubmit() {
    this.errorMessage = '';
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const loginData = this.loginForm.value as LoginDTO;
    this.authService.login(loginData).subscribe({
      next: (response) => {
        if (response.isAuthenticated) {
          const returnUrl = sanitizeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl'));
          this.router.navigateByUrl(returnUrl);
          return;
        }
        this.errorMessage = 'Invalid email or password. Please try again.';
      },
      error: (err) => {
        this.errorMessage = parseApiError(err, 'Unable to sign in. Check your credentials and try again.');
      },
    });
  }
}
