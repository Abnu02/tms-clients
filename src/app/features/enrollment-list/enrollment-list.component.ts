import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { EnrollmentStore } from '../../store/enrollment.store';

import { DashboardSummaryComponent } from './dashboard-summary.component';

@Component({
  selector: 'app-enrollment-list',
  standalone: true,
  imports: [DatePipe, DashboardSummaryComponent],
  templateUrl: './enrollment-list.component.html',
  styleUrl: './enrollment-list.component.scss',
})
export class EnrollmentListComponent implements OnInit {
  store = inject(EnrollmentStore);

  ngOnInit() {
    this.store.loadEnrollments();
  }

  onApprove(id: string) {
    this.store.approveEnrollment(id);
  }
}
