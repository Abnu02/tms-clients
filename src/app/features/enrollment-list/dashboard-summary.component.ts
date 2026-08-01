import { Component, inject } from '@angular/core';
import { EnrollmentStore } from '../../store/enrollment.store';

@Component({
  selector: 'app-dashboard-summary',
  standalone: true,
  imports: [],
  template: `
    <div class="summary-card">
      <h3>Enrollment Summary</h3>

      <div class="stat">
        <span class="label">Pending</span>
        <span class="value pending">{{ store.pendingCount() }}</span>
      </div>

      <div class="stat">
        <span class="label">Total</span>
        <span class="value">{{ store.entities().length }}</span>
      </div>

      @if (store.isLoading()) {
        <p class="loading">Fetching data...</p>
      }
    </div>
  `,
  styles: [`
    .summary-card {
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #f9f9f9;
    }
    .stat { display: flex; justify-content: space-between; margin: 0.5rem 0; }
    .value { font-weight: bold; font-size: 1.2rem; }
    .value.pending { color: #e67e22; }
    .loading { font-size: 0.85rem; color: #888; }
  `]
})
export class DashboardSummaryComponent {
  store = inject(EnrollmentStore);
}
