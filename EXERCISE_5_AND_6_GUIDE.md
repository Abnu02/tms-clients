# Module 8: Step-by-Step Implementation Guide (Exercises 5 & 6)

This document provides exact step-by-step instructions to implement and fix **Exercise 5** (The Enrollment Form) and **Exercise 6** (Connecting to the .NET API) in the `tms-clients` Angular project.

---

## Table of Contents
1. [Exercise 5: The Enrollment Form](#exercise-5-the-enrollment-form)
   - [Step 1: Component & Form Model](#step-1-component--form-model)
   - [Step 2: Form HTML Template](#step-2-form-html-template)
   - [Step 3: Route Configuration](#step-3-route-configuration)
2. [Exercise 6: Connecting to the .NET API](#exercise-6-connecting-to-the-net-api)
   - [Step 1: Course Service Fixes](#step-1-course-service-fixes)
   - [Step 2: Student Dashboard Component Clean-up](#step-2-student-dashboard-component-clean-up)
   - [Step 3: Student Dashboard Template](#step-3-student-dashboard-template)
3. [Verification & Testing](#verification--testing)

---

## Exercise 5: The Enrollment Form

### Step 1: Component & Form Model
**Target File:** `src/app/features/enrollment-form/enrollment-form.ts`

**Key Fixes Applied:**
- Grouped `studentId` validators inside an array: `[Validators.required, Validators.pattern('^STU-[0-9]{4}$')]`.
- Replaced missing `markAllAsTouched()` call in `submit()` when form is invalid.

```typescript
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';

@Component({
  selector: 'app-enrollment-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './enrollment-form.html',
  styleUrl: './enrollment-form.scss',
})
export class EnrollmentForm {
  private fb = inject(FormBuilder);
  submitted = signal(false);

  form = this.fb.nonNullable.group({
    studentId: [
      '',
      [Validators.required, Validators.pattern('^STU-[0-9]{4}$')],
    ],
    courseId: ['', Validators.required],
    term: ['Fall 2026', Validators.required],
    notes: [''],
    backupCourses: this.fb.array<FormControl<string>>([]),
  });

  get backups() {
    return this.form.controls.backupCourses;
  }

  addBackup() {
    this.backups.push(
      this.fb.control('', {
        nonNullable: true,
        validators: Validators.required,
      }),
    );
  }

  removeBackup(index: number) {
    this.backups.removeAt(index);
  }

  submit() {
    if (this.form.valid) {
      const payload = this.form.getRawValue();
      console.log('Enrollment payload:', payload);
      this.submitted.set(true);
    } else {
      // Force Angular to show validation errors on all fields
      this.form.markAllAsTouched();
    }
  }
}
```

---

### Step 2: Form HTML Template
**Target File:** `src/app/features/enrollment-form/enrollment-form.html`

```html
<h2>Course Enrollment</h2>

@if (submitted()) {
  <div class="success">Enrollment submitted. Check the console for the payload.</div>
} @else {
  <form [formGroup]="form" (ngSubmit)="submit()">
    <label for="studentId">Student ID</label>
    <input
      id="studentId"
      formControlName="studentId"
      placeholder="e.g. STU-1234"
    />
    @if (form.controls.studentId.touched && form.controls.studentId.invalid) {
      <span class="error">Enter a valid Student ID (format: STU-0000)</span>
    }

    <label for="courseId">Course ID</label>
    <input
      id="courseId"
      formControlName="courseId"
      placeholder="e.g. 1 (TMS course primary key)"
    />
    @if (form.controls.courseId.touched && form.controls.courseId.invalid) {
      <span class="error">Course ID is required</span>
    }

    <label for="term">Term</label>
    <input id="term" formControlName="term" />

    <label for="notes">Notes (optional)</label>
    <textarea id="notes" formControlName="notes"></textarea>

    <h3>Backup Courses</h3>
    @for (backup of backups.controls; track $index) {
      <div class="backup-row">
        <input
          [formControl]="backup"
          [placeholder]="'Backup course ' + ($index + 1)"
        />
        <button type="button" (click)="removeBackup($index)">Remove</button>
      </div>
    }

    <button type="button" (click)="addBackup()">Add Backup Course</button>

    <hr />
    <button type="submit" [disabled]="form.invalid">Confirm Enrollment</button>
  </form>
}
```

---

### Step 3: Route Configuration
**Target File:** `src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
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
];
```

---

## Exercise 6: Connecting to the .NET API

### Step 1: Course Service Fixes
**Target File:** `src/app/services/course.service.ts`

**Key Fixes Applied:**
- Changed `@Service()` to standard `@Injectable({ providedIn: 'root' })`.
- Mapped `p.items` in `getAll()` via `.pipe(map((p) => p.items))` so it returns `Observable<Course[]>`.

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Course, CourseDetail, PagedResponse } from '../models/course.model';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:5001/api/courses';

  getAll(page = 1, pageSize = 50) {
    return this.http
      .get<PagedResponse<Course>>(this.baseUrl, {
        params: { page: page.toString(), pageSize: pageSize.toString() },
      })
      .pipe(map((p) => p.items));
  }

  getById(id: string) {
    return this.http.get<CourseDetail>(`${this.baseUrl}/${id}`);
  }
}
```

---

### Step 2: Student Dashboard Component Clean-up
**Target File:** `src/app/features/student-dashboard/student-dashboard.component.ts`

**Key Fixes Applied:**
- Removed hardcoded `availableCourses` mock signal.
- Cleaned up `handleEnroll` method.

```typescript
import { Component, signal, computed, inject } from '@angular/core';
import { CourseCardComponent } from '../../ui/course-card/course-card';
import { Course } from '../../models/course.model';
import { rxResource } from '@angular/core/rxjs-interop';
import { CourseService } from '../../services/course.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.scss',
  imports: [CourseCardComponent],
})
export class StudentDashboardComponent {
  private api = inject(CourseService);

  studentName = signal('Liya Kebede');
  earnedCredits = signal(45);

  graduationStatus = computed(() =>
    this.earnedCredits() >= 120 ? 'Eligible for Graduation' : 'In Progress',
  );

  coursesResource = rxResource({ stream: () => this.api.getAll() });
  selectedCourse = signal<Course | null>(null);

  handleEnroll(course: Course) {
    this.selectedCourse.set(course);
    console.log('Enrollment requested for:', course.title);
  }
}
```

---

### Step 3: Student Dashboard Template
**Target File:** `src/app/features/student-dashboard/student-dashboard.component.html`

```html
<h2>Course Catalog</h2>

@if (coursesResource.isLoading()) {
  <div class="spinner">Fetching courses from the server...</div>
} @else if (coursesResource.error()) {
  <div class="error">Could not load courses. Make sure your .NET API is running.</div>
} @else {
  <div class="grid">
    @for (course of coursesResource.value()!; track course.id) {
      <tms-course-card [course]="course" (enrollClicked)="handleEnroll($event)" />
    } @empty {
      <p>No courses are available this term.</p>
    }
  </div>
}
```

---

## Verification & Testing

To verify all changes are compiling and working properly, run:

```bash
# Test application build
npm run build
```
