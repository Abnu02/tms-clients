import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CourseCardComponent } from '../../ui/course-card/course-card';
import { Course } from '../../models/course.model';
import { rxResource } from '@angular/core/rxjs-interop';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.scss',
  imports: [CommonModule, FormsModule, CourseCardComponent],
})
export class StudentDashboardComponent {
  private api = inject(CourseService);
  protected auth = inject(AuthService);
  private toast = inject(ToastService);

  searchQuery = signal('');
  earnedCredits = signal(45);

  graduationProgress = computed(() => {
    return Math.min(100, Math.round((this.earnedCredits() / 120) * 100));
  });

  graduationStatus = computed(() =>
    this.earnedCredits() >= 120 ? 'Eligible for Graduation' : 'In Progress (Active Term)',
  );

  coursesResource = rxResource({ stream: () => this.api.getAll() });

  filteredCourses = computed(() => {
    const list = this.coursesResource.value() || [];
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return list;
    return list.filter(c => c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q));
  });

  handleEnroll(course: Course) {
    this.earnedCredits.update(c => Math.min(120, c + 3));
    this.toast.success(`Enrolled in ${course.code}: ${course.title}! +3 Credits added.`, 'Enrollment Submitted');
  }

  deleteCourse(id: number) {
    this.api.deleteCourse(id).subscribe({
      next: () => {
        this.toast.success(`Course #${id} deleted successfully.`);
        this.coursesResource.reload();
      },
      error: (err) => {
        this.toast.error(`Delete failed: ${err.message || 'Unauthorized'}`);
      }
    });
  }
}
