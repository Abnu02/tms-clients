import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorDashboardComponent } from './instructor-dashboard.component';

describe('InstructorDashboardComponent', () => {
  let component: InstructorDashboardComponent;
  let fixture: ComponentFixture<InstructorDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InstructorDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the dashboard hero and summary cards', () => {
    fixture.detectChanges();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Enrollment command center');
    expect(content).toContain('Total enrollments');
  });
});
