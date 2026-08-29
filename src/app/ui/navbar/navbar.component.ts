import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LiveSyncService } from '../../services/live-sync.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="navbar">
      <div class="nav-brand">
        <a routerLink="/" class="brand-link">
          <span class="brand-icon">⚡</span>
          <span class="brand-name">TMS <span class="brand-subtitle">Portal</span></span>
        </a>

        <!-- SignalR Live Status Indicator -->
        <div class="live-status" [ngClass]="'status-' + liveSync.connectionState()" title="SignalR Live Status">
          <span class="pulse-dot"></span>
          <span class="status-label">
            @switch (liveSync.connectionState()) {
              @case ('connected') { Live }
              @case ('reconnecting') { Reconnecting }
              @default { Offline }
            }
          </span>
        </div>
      </div>

      <nav class="nav-links">
        <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: false }">Dashboard</a>
        <a routerLink="/courses" routerLinkActive="active">Courses</a>
        <a routerLink="/enrollments" routerLinkActive="active">Enrollments</a>
        <a routerLink="/enroll" routerLinkActive="active">Enroll Form</a>

        @if (auth.hasRole('Instructor') || auth.hasRole('Admin')) {
          <a routerLink="/grade-submission" routerLinkActive="active">Grades</a>
        }

        <!-- Admin Only Navigation -->
        @if (auth.hasRole('Admin')) {
          <a routerLink="/admin/courses" routerLinkActive="active" class="admin-link">
            <span class="admin-badge">Admin</span> Courses
          </a>
        }
      </nav>

      <div class="nav-auth">
        @if (auth.currentUser(); as user) {
          <div class="user-profile">
            <div class="user-avatar">{{ user.displayName.charAt(0).toUpperCase() }}</div>
            <div class="user-meta">
              <span class="user-name">{{ user.displayName }}</span>
              <span class="role-pill" [ngClass]="'role-' + (user.role | lowercase)">{{ user.role }}</span>
            </div>
            <button type="button" class="btn-logout" (click)="handleLogout()" title="Log out">
              Log out
            </button>
          </div>
        } @else {
          <a routerLink="/login" class="btn-login">Sign In</a>
        }
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 2rem;
      background: #0f172a;
      border-bottom: 1px solid #1e293b;
      color: #f8fafc;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: inherit;
    }

    .brand-icon {
      font-size: 1.5rem;
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-name {
      font-weight: 700;
      font-size: 1.25rem;
      letter-spacing: -0.025em;
    }

    .brand-subtitle {
      font-weight: 400;
      color: #94a3b8;
      font-size: 0.875rem;
    }

    .live-status {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
      font-weight: 500;
      border: 1px solid transparent;
      margin-left: 0.5rem;
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .status-connected {
      background: rgba(16, 185, 129, 0.12);
      border-color: rgba(16, 185, 129, 0.25);
      color: #34d399;

      .pulse-dot {
        background: #10b981;
        box-shadow: 0 0 8px #10b981;
      }
    }

    .status-reconnecting {
      background: rgba(245, 158, 11, 0.12);
      border-color: rgba(245, 158, 11, 0.25);
      color: #fbbf24;

      .pulse-dot {
        background: #f59e0b;
      }
    }

    .status-disconnected {
      background: rgba(148, 163, 184, 0.12);
      border-color: rgba(148, 163, 184, 0.25);
      color: #94a3b8;

      .pulse-dot {
        background: #94a3b8;
      }
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      a {
        color: #94a3b8;
        text-decoration: none;
        padding: 0.45rem 0.85rem;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.15s ease-in-out;

        &:hover {
          color: #f8fafc;
          background: rgba(255, 255, 255, 0.06);
        }

        &.active {
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.1);
        }
      }
    }

    .admin-link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .admin-badge {
      background: #7c3aed;
      color: #fff;
      font-size: 0.7rem;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      text-transform: uppercase;
      font-weight: 700;
    }

    .nav-auth {
      display: flex;
      align-items: center;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #1e293b;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      border: 1px solid #334155;
    }

    .user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0ea5e9, #6366f1);
      color: white;
      font-weight: 700;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-meta {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: #f1f5f9;
      line-height: 1.1;
    }

    .role-pill {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .role-admin {
      color: #c084fc;
    }

    .role-instructor {
      color: #60a5fa;
    }

    .role-student {
      color: #34d399;
    }

    .btn-logout {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 0.8rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      transition: all 0.15s;

      &:hover {
        color: #f87171;
        background: rgba(239, 68, 68, 0.1);
      }
    }

    .btn-login {
      background: #0284c7;
      color: #fff;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      transition: background 0.15s;

      &:hover {
        background: #0369a1;
      }
    }

    @media (max-width: 768px) {
      .navbar {
        padding: 0.75rem 1rem;
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .nav-links {
        order: 3;
        width: 100%;
        overflow-x: auto;
        padding-bottom: 0.25rem;
      }
    }
  `]
})
export class NavbarComponent {
  auth = inject(AuthService);
  liveSync = inject(LiveSyncService);
  toast = inject(ToastService);
  private router = inject(Router);

  handleLogout() {
    this.auth.logout();
    this.toast.info('You have logged out.');
    this.router.navigate(['/login']);
  }
}
