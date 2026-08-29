import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  loading = false;
  errorMessage = '';
  rateLimitCountdown = 0;
  private timerInterval?: any;

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  quickFill(email: string, role: string) {
    this.loginForm.setValue({
      email,
      password: 'Password123!@',
    });
    this.errorMessage = '';
  }

  async login(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      await this.authService.login(this.loginForm.getRawValue());
      const user = this.authService.currentUser();
      this.toast.success(`Welcome back, ${user?.displayName || 'User'}!`, 'Signed In');
      await this.router.navigate(['/dashboard']);
    } catch (error: any) {
      console.error('Login error:', error);

      if (error instanceof HttpErrorResponse) {
        if (error.status === 429) {
          this.errorMessage = 'Rate limit reached. Too many login attempts in a short window. Please wait 60 seconds.';
          this.startRateLimitCountdown(60);
          this.toast.error('Rate limit reached (429 Too Many Requests).', 'Security Protection');
        } else if (error.status === 423) {
          this.errorMessage = 'Your account has been locked due to 5 consecutive failed login attempts. Try again in 15 minutes.';
          this.toast.error('Account locked (423 Locked).', 'Security Lockout');
        } else if (error.status === 401) {
          this.errorMessage = 'Invalid email or password. Please verify your credentials.';
        } else {
          this.errorMessage = error.error?.detail || error.error?.message || 'Login failed. Please verify the API is running.';
        }
      } else {
        this.errorMessage = 'An unexpected error occurred during login.';
      }
    } finally {
      this.loading = false;
    }
  }

  private startRateLimitCountdown(seconds: number) {
    this.rateLimitCountdown = seconds;
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      this.rateLimitCountdown--;
      if (this.rateLimitCountdown <= 0) {
        clearInterval(this.timerInterval);
        this.errorMessage = '';
      }
    }, 1000);
  }
}