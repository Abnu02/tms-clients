import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EnrollmentStore } from '../../store/enrollment.store';
import { CreateEnrollmentPayload } from '../../models/enrollment.model';

@Component({
  selector: 'app-enrollment-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './enrollment-form.html',
  styleUrl: './enrollment-form.scss',
})
export class EnrollmentForm {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private store = inject(EnrollmentStore);

  submitted = signal(false);

  form = this.fb.nonNullable.group({
    studentId: ['', [Validators.required, Validators.pattern('^TMS-[0-9]{4}-[0-9]{4}$')]],
    courseId: ['', Validators.required],
    term: ['Fall 2026', Validators.required],
    notes: [''],
    backupCourses: this.fb.array<FormControl<string>>([]),
  });

  get backups() {
    return this.form.controls.backupCourses;
  }

  addBackup() {
    this.backups.push(this.fb.control('', { nonNullable: true, validators: Validators.required }));
  }

  removeBackup(index: number) {
    this.backups.removeAt(index);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: CreateEnrollmentPayload = this.form.getRawValue();
    this.store.submitEnrollment(payload);

    this.submitted.set(true);
    setTimeout(() => this.router.navigate(['/enrollments']), 1500);
  }
}
