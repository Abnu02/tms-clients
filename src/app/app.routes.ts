import { Routes } from '@angular/router';
import { roleGuard } from './guards/role.guard';
import { AdminCourseListComponent } from './features/admin-course-list/admin-course-list.component';
import { UnauthorizedComponent } from './features/unauthorized/unauthorized.component';

export const routes: Routes = [

  {
    path: 'login',
    loadComponent: () =>
      import('./login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard-host/dashboard-host.component').then(
        (m) => m.DashboardHostComponent,
      ),
  },
  {
    path: 'courses',
    loadComponent: () =>
      import('./features/student-dashboard/student-dashboard.component').then(
        (m) => m.StudentDashboardComponent,
      ),
  },
  {
    path: 'courses/:id',
    loadComponent: () =>
      import('./features/course-detail/course-detail.component').then(
        (m) => m.CourseDetailComponent,
      ),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'enroll',
    loadComponent: () =>
      import('./features/enrollment-form/enrollment-form').then(
        (m) => m.EnrollmentForm,
      ),
  },

  {
    path: 'enrollments',
    loadComponent: () =>
      import('./features/enrollment-list/enrollment-list.component').then(
        (m) => m.EnrollmentListComponent,
      ),
  },
  {
    path: 'grade-submission',
    loadComponent: () =>
      import('./features/grade-submission/grade-submission.component').then(
        (m) => m.GradeSubmissionComponent,
      ),
  },
  {
    path: 'admin/courses',
    component: AdminCourseListComponent,
    canActivate: [roleGuard('Admin')],
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
  },
];
