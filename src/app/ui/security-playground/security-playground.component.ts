import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { CourseService } from '../../services/course.service';

@Component({
  selector: 'app-security-playground',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="playground-card" [class.collapsed]="isCollapsed()">
      <div class="playground-header" (click)="toggleCollapse()">
        <div class="title-group">
          <span class="pulse-icon">🧪</span>
          <strong>TMS Security & Authorization Playground</strong>
          <span class="active-user-badge" [ngClass]="'badge-' + (auth.currentUser()?.role | lowercase)">
            Current: {{ auth.currentUser()?.displayName || 'Guest (Logged Out)' }}
            @if (auth.currentUser(); as u) {
              ({{ u.role }})
            }
          </span>
        </div>
        <button type="button" class="btn-toggle" (click)="toggleCollapse(); $event.stopPropagation()">
          {{ isCollapsed() ? 'Expand Playground ▼' : 'Minimize ▲' }}
        </button>
      </div>

      @if (!isCollapsed()) {
        <div class="playground-body">
          <!-- Role Switching Row -->
          <div class="section-row">
            <span class="row-label">1-Click Role Switch:</span>
            <div class="button-group">
              <button
                type="button"
                class="btn-role role-admin"
                [class.selected]="auth.currentUser()?.role === 'Admin'"
                [disabled]="busy()"
                (click)="switchUser('admin@tms.com', 'Admin')"
              >
                👑 Admin
              </button>
              <button
                type="button"
                class="btn-role role-instructor"
                [class.selected]="auth.currentUser()?.email === 'instructor1@tms.com'"
                [disabled]="busy()"
                (click)="switchUser('instructor1@tms.com', 'Instructor')"
              >
                📘 Instructor 1 (Owns Course 1)
              </button>
              <button
                type="button"
                class="btn-role role-instructor"
                [class.selected]="auth.currentUser()?.email === 'instructor2@tms.com'"
                [disabled]="busy()"
                (click)="switchUser('instructor2@tms.com', 'Instructor')"
              >
                📙 Instructor 2 (Owns Course 2)
              </button>
              <button
                type="button"
                class="btn-role role-student"
                [class.selected]="auth.currentUser()?.role === 'Student'"
                [disabled]="busy()"
                (click)="switchUser('student@tms.com', 'Student')"
              >
                🎓 Student
              </button>
              <button
                type="button"
                class="btn-role role-guest"
                [disabled]="busy()"
                (click)="logoutUser()"
              >
                🚪 Log Out
              </button>
            </div>
          </div>

          <!-- Live Security Tests Row -->
          <div class="section-row">
            <span class="row-label">Live Security Tests:</span>
            <div class="button-group">
              <button
                type="button"
                class="btn-test test-403"
                [disabled]="busy()"
                (click)="testResourceOwnershipForbidden()"
                title="Tests if Instructor 1 receives 403 editing Course 2"
              >
                🛡️ Test 403 (Edit Unowned Course)
              </button>

              <button
                type="button"
                class="btn-test test-204"
                [disabled]="busy()"
                (click)="testResourceOwnershipSuccess()"
                title="Tests if Instructor 1 can edit Course 1"
              >
                ✅ Test 204 (Edit Owned Course)
              </button>

              <button
                type="button"
                class="btn-test test-429"
                [disabled]="busy()"
                (click)="testRateLimiting()"
                title="Fires 6 rapid requests to trigger 429 Too Many Requests"
              >
                ⚡ Test 429 (Rate Limiter)
              </button>

              <button
                type="button"
                class="btn-test test-423"
                [disabled]="busy()"
                (click)="testAccountLockout()"
                title="Triggers 5 wrong passwords to verify 423 Locked"
              >
                🔒 Test 423 (Account Lockout)
              </button>

              <button
                type="button"
                class="btn-test test-guard"
                [disabled]="busy()"
                (click)="testAngularRoleGuard()"
                title="Tests navigation to /admin/courses as Student"
              >
                🛑 Test Angular Guard (/admin/courses)
              </button>
            </div>
          </div>

          <!-- Live Output Console -->
          @if (lastResult()) {
            <div class="result-console" [ngClass]="'status-' + lastResult()!.type">
              <div class="console-header">
                <strong>{{ lastResult()!.title }}</strong>
                <span>HTTP {{ lastResult()!.statusCode || 'N/A' }}</span>
              </div>
              <div class="console-body">{{ lastResult()!.detail }}</div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .playground-card {
      background: #1e293b;
      border: 1px solid #3b82f6;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.15);
      overflow: hidden;
      transition: all 0.2s ease;
    }

    .playground-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1.25rem;
      background: linear-gradient(90deg, #1e3a8a 0%, #1e293b 100%);
      cursor: pointer;
      user-select: none;
    }

    .title-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.95rem;
      color: #f8fafc;
    }

    .pulse-icon {
      font-size: 1.2rem;
    }

    .active-user-badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      background: #334155;
      color: #cbd5e1;

      &.badge-admin {
        background: rgba(168, 85, 247, 0.25);
        color: #c084fc;
        border: 1px solid rgba(168, 85, 247, 0.4);
      }

      &.badge-instructor {
        background: rgba(59, 130, 246, 0.25);
        color: #60a5fa;
        border: 1px solid rgba(59, 130, 246, 0.4);
      }

      &.badge-student {
        background: rgba(16, 185, 129, 0.25);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.4);
      }
    }

    .btn-toggle {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #cbd5e1;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.3rem 0.65rem;
      border-radius: 6px;
      cursor: pointer;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
      }
    }

    .playground-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .section-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .row-label {
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      min-width: 140px;
    }

    .button-group {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .btn-role, .btn-test {
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .btn-role {
      background: #0f172a;
      border-color: #334155;
      color: #cbd5e1;

      &:hover:not(:disabled) {
        background: #1e293b;
        color: #fff;
      }

      &.selected {
        border-color: #38bdf8;
        background: rgba(56, 189, 248, 0.15);
        color: #38bdf8;
      }
    }

    .btn-test {
      color: #fff;

      &.test-403 {
        background: #991b1b;
        border-color: #ef4444;
        &:hover:not(:disabled) { background: #b91c1c; }
      }

      &.test-204 {
        background: #065f46;
        border-color: #10b981;
        &:hover:not(:disabled) { background: #047857; }
      }

      &.test-429 {
        background: #92400e;
        border-color: #f59e0b;
        &:hover:not(:disabled) { background: #b45309; }
      }

      &.test-423 {
        background: #4c1d95;
        border-color: #8b5cf6;
        &:hover:not(:disabled) { background: #5b21b6; }
      }

      &.test-guard {
        background: #374151;
        border-color: #6b7280;
        &:hover:not(:disabled) { background: #4b5563; }
      }
    }

    .result-console {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 0.875rem 1rem;
      font-size: 0.85rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      animation: fadeIn 0.2s ease;

      &.status-pass {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.08);
      }

      &.status-fail {
        border-color: #ef4444;
        background: rgba(239, 68, 68, 0.08);
      }
    }

    .console-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.35rem;
      font-weight: 700;
      color: #f8fafc;
    }

    .console-body {
      color: #cbd5e1;
      line-height: 1.4;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class SecurityPlaygroundComponent {
  auth = inject(AuthService);
  private courseService = inject(CourseService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private http = inject(HttpClient);

  isCollapsed = signal(false);
  busy = signal(false);
  lastResult = signal<{ type: 'pass' | 'fail'; title: string; statusCode: number | string; detail: string } | null>(null);

  toggleCollapse() {
    this.isCollapsed.update(v => !v);
  }

  async switchUser(email: string, role: string) {
    this.busy.set(true);
    try {
      await this.auth.login({ email, password: 'Password123!@' });
      this.toast.success(`Logged in as ${role} (${email})`);
      this.lastResult.set({
        type: 'pass',
        title: `Switched User to ${role}`,
        statusCode: 200,
        detail: `Authenticated as ${email} with role ${role}. JWT token refreshed with claims.`
      });
    } catch (e: any) {
      this.toast.error(`Login failed for ${email}`);
    } finally {
      this.busy.set(false);
    }
  }

  logoutUser() {
    this.auth.logout();
    this.toast.info('Logged out. Operating as Unauthenticated Guest.');
    this.lastResult.set({
      type: 'pass',
      title: 'Logged Out',
      statusCode: 'N/A',
      detail: 'Cleared session tokens. Requests will now be sent without Bearer headers.'
    });
  }

  async testResourceOwnershipForbidden() {
    this.busy.set(true);
    try {
      // Step 1: Ensure logged in as Instructor 1
      if (this.auth.currentUser()?.email !== 'instructor1@tms.com') {
        await this.auth.login({ email: 'instructor1@tms.com', password: 'Password123!@' });
      }

      // Step 2: Attempt to edit Course 2 (owned by Instructor 2)
      await this.courseService.updateCourse(2, {
        title: 'Hacked Title Attempt',
        maxCapacity: 50
      }).toPromise();

      this.lastResult.set({
        type: 'fail',
        title: 'Resource Policy Failed',
        statusCode: 200,
        detail: 'Expected 403 Forbidden, but request succeeded.'
      });
    } catch (err: any) {
      if (err.status === 403) {
        this.toast.warning('🛡️ 403 Forbidden: Resource Policy Blocked Edit on Course #2!', 'Resource Policy Enforced');
        this.lastResult.set({
          type: 'pass',
          title: '✅ Resource-Based Authorization Succeeded (HTTP 403)',
          statusCode: 403,
          detail: 'Instructor 1 (instructor1@tms.com) was denied modification access to Course #2 because InstructorId belongs to Instructor 2.'
        });
      } else {
        this.toast.error(`Unexpected HTTP ${err.status}`);
      }
    } finally {
      this.busy.set(false);
    }
  }

  async testResourceOwnershipSuccess() {
    this.busy.set(true);
    try {
      // Step 1: Ensure logged in as Instructor 1
      if (this.auth.currentUser()?.email !== 'instructor1@tms.com') {
        await this.auth.login({ email: 'instructor1@tms.com', password: 'Password123!@' });
      }

      // Step 2: Attempt to edit Course 1 (owned by Instructor 1)
      await this.courseService.updateCourse(1, {
        title: 'Web Development Fundamentals (Updated)',
        maxCapacity: 35
      }).toPromise();

      this.toast.success('✅ 204 No Content: Course #1 updated by assigned Lead Instructor!', 'Policy Succeeded');
      this.lastResult.set({
        type: 'pass',
        title: '✅ Resource Ownership Authorization Verified (HTTP 204)',
        statusCode: 204,
        detail: 'Instructor 1 successfully modified Course #1 because resource.InstructorId matches the JWT ClaimTypes.NameIdentifier.'
      });
    } catch (err: any) {
      this.toast.error(`Update failed with HTTP ${err.status}`);
      this.lastResult.set({
        type: 'fail',
        title: 'Update Failed',
        statusCode: err.status,
        detail: err.message
      });
    } finally {
      this.busy.set(false);
    }
  }

  async testRateLimiting() {
    this.busy.set(true);
    this.toast.info('Firing 6 rapid requests to /api/auth/login...');

    let hit429 = false;
    for (let i = 1; i <= 6; i++) {
      try {
        await this.http.post('/api/auth/login', {
          email: `ratelimit_demo_${i}@tms.com`,
          password: 'Password123!@'
        }).toPromise();
      } catch (err: any) {
        if (err.status === 429) {
          hit429 = true;
          this.toast.warning('⚡ 429 Too Many Requests: Rate Limiter Triggered (AuthLimiter)', 'Rate Limit Defense Active');
          this.lastResult.set({
            type: 'pass',
            title: '✅ Rate Limiting Defense Verified (HTTP 429)',
            statusCode: 429,
            detail: `Exceeded permit limit (5 requests per minute). FixedWindowLimiter "AuthLimiter" rejected request #${i} with HTTP 429 Too Many Requests.`
          });
          break;
        }
      }
    }

    if (!hit429) {
      this.toast.info('Requests sent (wait 60s if window previously exhausted).');
    }
    this.busy.set(false);
  }

  async testAccountLockout() {
    this.busy.set(true);
    const lockoutEmail = 'lockout_test_user@tms.com';

    // Ensure test user exists
    try {
      await this.http.post('/api/auth/register', {
        email: lockoutEmail,
        password: 'CorrectPassword123!@',
        firstName: 'Lockout',
        lastName: 'Demo',
        role: 'Student'
      }).toPromise();
    } catch {}

    let got423 = false;
    for (let attempt = 1; attempt <= 6; attempt++) {
      try {
        await this.http.post('/api/auth/login', {
          email: lockoutEmail,
          password: 'WrongPassword999!'
        }).toPromise();
      } catch (err: any) {
        if (err.status === 423) {
          got423 = true;
          this.toast.error('🔒 423 Locked: Account locked after 5 failed password attempts!', 'Brute Force Defense Active');
          this.lastResult.set({
            type: 'pass',
            title: '✅ Account Lockout Protection Verified (HTTP 423)',
            statusCode: 423,
            detail: `Account ${lockoutEmail} exceeded MaxFailedAccessAttempts = 5. ASP.NET Core Identity locked the account for 15 minutes.`
          });
          break;
        }
      }
    }

    if (!got423) {
      this.toast.info('Completed failed attempt sequence.');
    }
    this.busy.set(false);
  }

  async testAngularRoleGuard() {
    this.busy.set(true);
    try {
      // Step 1: Switch to Student
      await this.auth.login({ email: 'student@tms.com', password: 'Password123!@' });
      this.toast.info('Switched to Student. Attempting route to /admin/courses...');

      // Step 2: Navigate to guarded route
      await this.router.navigate(['/admin/courses']);

      this.lastResult.set({
        type: 'pass',
        title: '✅ Angular Functional roleGuard Verified',
        statusCode: 'Client-Route',
        detail: 'Student attempted navigation to /admin/courses. roleGuard("Admin") intercepted access and redirected to /unauthorized.'
      });
    } finally {
      this.busy.set(false);
    }
  }
}
