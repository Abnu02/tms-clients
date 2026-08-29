import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../services/course.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Course } from '../../models/course.model';

@Component({
  selector: 'app-admin-course-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container">
      <div class="header-section">
        <div>
          <div class="badge-admin">🔒 Admin Control Panel</div>
          <h1>Course Governance & Capacity</h1>
          <p class="subtitle">Manage course limits, quotas, and instructor authorizations</p>
        </div>
        <div class="search-bar">
          <input
            type="text"
            placeholder="Search courses by code or title..."
            [(ngModel)]="searchQuery"
          />
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-num">{{ filteredCourses().length }}</div>
          <div class="stat-title">Active Courses</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">{{ totalSeats() }}</div>
          <div class="stat-title">Total Capacity Seats</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">{{ totalEnrolled() }}</div>
          <div class="stat-title">Total Enrolled</div>
        </div>
      </div>

      @if (coursesResource.isLoading()) {
        <div class="loading-state">
          <span class="spinner"></span> Loading course directory...
        </div>
      } @else if (coursesResource.error()) {
        <div class="error-state">
          ⚠️ Could not load course directory from .NET API.
        </div>
      } @else {
        <div class="table-card">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Capacity / Enrolled</th>
                <th>Occupancy</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (course of filteredCourses(); track course.id) {
                <tr>
                  <td>
                    <span class="course-code-pill">{{ course.code }}</span>
                  </td>
                  <td class="course-title-cell">
                    <strong>{{ course.title }}</strong>
                  </td>
                  <td>
                    {{ course.enrollmentCount || 0 }} / {{ course.maxCapacity }} seats
                  </td>
                  <td>
                    <div class="progress-bar-wrap">
                      <div
                        class="progress-bar-fill"
                        [style.width.%]="calcPercentage(course)"
                        [ngClass]="getOccupancyClass(course)"
                      ></div>
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <button
                      type="button"
                      class="btn-edit"
                      (click)="openEdit(course)"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      class="btn-delete"
                      (click)="handleDelete(course)"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="empty-cell">No matching courses found.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Quick Edit Modal -->
      @if (editingCourse(); as course) {
        <div class="modal-backdrop" (click)="cancelEdit()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <h2>Edit Course #{{ course.id }}</h2>
            <p class="modal-sub">Update title and capacity. Tests resource-based authorization.</p>

            <div class="form-group">
              <label>Course Code</label>
              <input type="text" [value]="course.code" disabled class="input-disabled" />
            </div>

            <div class="form-group">
              <label>Course Title</label>
              <input type="text" [(ngModel)]="editTitle" />
            </div>

            <div class="form-group">
              <label>Max Capacity</label>
              <input type="number" [(ngModel)]="editCapacity" min="1" max="200" />
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-cancel" (click)="cancelEdit()">Cancel</button>
              <button type="button" class="btn-save" (click)="saveEdit()">Save Changes</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .badge-admin {
      display: inline-block;
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    h1 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: #f8fafc;
    }

    .subtitle {
      margin: 0.25rem 0 0 0;
      color: #94a3b8;
      font-size: 0.9rem;
    }

    .search-bar input {
      background: #1e293b;
      border: 1px solid #334155;
      color: #f8fafc;
      padding: 0.65rem 1rem;
      border-radius: 8px;
      width: 280px;
      outline: none;
      transition: all 0.15s;

      &:focus {
        border-color: #38bdf8;
        box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
      }
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 1.25rem;
    }

    .stat-num {
      font-size: 1.85rem;
      font-weight: 700;
      color: #38bdf8;
    }

    .stat-title {
      font-size: 0.8rem;
      color: #94a3b8;
      font-weight: 500;
      margin-top: 0.25rem;
    }

    .table-card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      overflow: hidden;
    }

    .custom-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;

      th {
        background: #0f172a;
        padding: 0.85rem 1.25rem;
        color: #94a3b8;
        font-weight: 600;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 1px solid #334155;
      }

      td {
        padding: 1rem 1.25rem;
        border-bottom: 1px solid #334155;
        color: #e2e8f0;
      }

      tr:last-child td {
        border-bottom: none;
      }
    }

    .course-code-pill {
      background: rgba(14, 165, 233, 0.12);
      color: #38bdf8;
      padding: 0.25rem 0.55rem;
      border-radius: 6px;
      font-family: monospace;
      font-weight: 600;
      font-size: 0.85rem;
    }

    .progress-bar-wrap {
      width: 120px;
      height: 8px;
      background: #334155;
      border-radius: 9999px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.3s ease;
    }

    .fill-low { background: #34d399; }
    .fill-med { background: #38bdf8; }
    .fill-high { background: #f59e0b; }
    .fill-full { background: #ef4444; }

    .btn-edit {
      background: #0284c7;
      color: white;
      border: none;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 600;
      margin-right: 0.5rem;
      transition: background 0.15s;

      &:hover {
        background: #0369a1;
      }
    }

    .btn-delete {
      background: transparent;
      color: #f87171;
      border: 1px solid rgba(248, 113, 113, 0.3);
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 600;
      transition: all 0.15s;

      &:hover {
        background: rgba(239, 68, 68, 0.1);
        border-color: #ef4444;
      }
    }

    .empty-cell {
      text-align: center;
      padding: 2.5rem !important;
      color: #94a3b8;
    }

    /* Modal Styles */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.65);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .modal-card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 14px;
      padding: 2rem;
      width: 90%;
      max-width: 450px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);

      h2 {
        margin: 0 0 0.25rem 0;
        font-size: 1.35rem;
        color: #f8fafc;
      }

      .modal-sub {
        margin: 0 0 1.25rem 0;
        font-size: 0.85rem;
        color: #94a3b8;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      margin-bottom: 1rem;

      label {
        font-size: 0.85rem;
        font-weight: 500;
        color: #cbd5e1;
      }

      input {
        background: #0f172a;
        border: 1px solid #334155;
        color: #f8fafc;
        padding: 0.65rem 0.85rem;
        border-radius: 6px;
        font-size: 0.9rem;
        outline: none;

        &:focus {
          border-color: #38bdf8;
        }

        &.input-disabled {
          opacity: 0.6;
        }
      }
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }

    .btn-cancel {
      background: transparent;
      border: 1px solid #475569;
      color: #94a3b8;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-save {
      background: #0284c7;
      border: none;
      color: white;
      padding: 0.5rem 1.25rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    }
  `]
})
export class AdminCourseListComponent {
  private courseService = inject(CourseService);
  auth = inject(AuthService);
  toast = inject(ToastService);

  searchQuery = signal('');
  coursesResource = rxResource({ stream: () => this.courseService.getAll() });

  editingCourse = signal<Course | null>(null);
  editTitle = '';
  editCapacity = 30;

  filteredCourses = computed(() => {
    const list = this.coursesResource.value() || [];
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return list;
    return list.filter(c => c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q));
  });

  totalSeats = computed(() => {
    return (this.coursesResource.value() || []).reduce((acc, c) => acc + (c.maxCapacity || 0), 0);
  });

  totalEnrolled = computed(() => {
    return (this.coursesResource.value() || []).reduce((acc, c) => acc + (c.enrollmentCount || 0), 0);
  });

  calcPercentage(course: Course): number {
    if (!course.maxCapacity) return 0;
    return Math.min(100, Math.round(((course.enrollmentCount || 0) / course.maxCapacity) * 100));
  }

  getOccupancyClass(course: Course): string {
    const pct = this.calcPercentage(course);
    if (pct >= 90) return 'fill-full';
    if (pct >= 70) return 'fill-high';
    if (pct >= 40) return 'fill-med';
    return 'fill-low';
  }

  openEdit(course: Course) {
    this.editingCourse.set(course);
    this.editTitle = course.title;
    this.editCapacity = course.maxCapacity;
  }

  cancelEdit() {
    this.editingCourse.set(null);
  }

  saveEdit() {
    const course = this.editingCourse();
    if (!course) return;

    this.courseService.updateCourse(course.id, {
      title: this.editTitle,
      maxCapacity: this.editCapacity
    }).subscribe({
      next: () => {
        this.toast.success(`Course "${this.editTitle}" updated successfully (HTTP 204).`);
        course.title = this.editTitle;
        course.maxCapacity = this.editCapacity;
        this.editingCourse.set(null);
      },
      error: (err) => {
        if (err.status === 403) {
          this.toast.error(`403 Forbidden: You do not have permission to edit Course #${course.id} (not assigned as lead instructor).`, 'Resource Authorization Policy');
        } else {
          this.toast.error(`Update failed with status ${err.status}`);
        }
      }
    });
  }

  handleDelete(course: Course) {
    this.toast.warning(`Course ${course.code} (${course.title}) marked for removal.`);
  }
}
