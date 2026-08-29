import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { InstructorDashboardComponent } from '../instructor-dashboard/instructor-dashboard.component';
import { StudentDashboardComponent } from '../student-dashboard/student-dashboard.component';
import { AdminCourseListComponent } from '../admin-course-list/admin-course-list.component';

@Component({
  selector: 'app-dashboard-host',
  standalone: true,
  imports: [
    CommonModule,
    InstructorDashboardComponent,
    StudentDashboardComponent,
    AdminCourseListComponent
  ],
  template: `
    <div class="dashboard-host-wrapper">
      @switch (auth.currentUser()?.role) {
        @case ('Admin') {
          <div class="role-view-header">
            <span class="role-badge badge-admin">👑 Administrator View</span>
          </div>
          <app-admin-course-list />
        }
        @case ('Instructor') {
          <div class="role-view-header">
            <span class="role-badge badge-instructor">📘 Lead Instructor View</span>
          </div>
          <app-instructor-dashboard />
        }
        @default {
          <div class="role-view-header">
            <span class="role-badge badge-student">🎓 Student & Course Catalog View</span>
          </div>
          <app-student-dashboard />
        }
      }
    </div>
  `,
  styles: [`
    .dashboard-host-wrapper {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .role-view-header {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .role-badge {
      font-size: 0.8rem;
      font-weight: 700;
      padding: 0.3rem 0.8rem;
      border-radius: 9999px;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }

    .badge-admin {
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.35);
    }

    .badge-instructor {
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.35);
    }

    .badge-student {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.35);
    }
  `]
})
export class DashboardHostComponent {
  auth = inject(AuthService);
}
