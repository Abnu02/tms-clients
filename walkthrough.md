# Implementation Walkthrough: Module 9 Lab Session 2

I have completed the implementation of the lab session. Here is a detailed, step-by-step breakdown of the exact code changes and a technical explanation of how each piece works.

## 1. Analytics Chart Component (`analytics-chart.component.ts`)

We replaced the empty component with signal-based inputs and computed properties.

```typescript
export class AnalyticsChartComponent {
  // input.required() forces the parent component to provide this data. 
  // It returns a Signal, making it completely reactive.
  data = input.required<Enrollment[]>();

  // computed() creates a new memoized Signal based on other Signals.
  // This function only re-runs when the underlying `data()` signal changes.
  approvedHeight = computed(() => {
    // We filter the array for 'Approved' items and get the count.
    const count = this.data().filter((e) => e.status === 'Approved').length;
    // We calculate a pixel height based on the count, ensuring a minimum of 20px.
    return Math.max(20, count * 3);
  });

  pendingHeight = computed(() => {
    const count = this.data().filter((e) => e.status === 'Pending').length;
    return Math.max(20, count * 3);
  });

  rejectedHeight = computed(() => {
    const count = this.data().filter((e) => e.status === 'Rejected').length;
    return Math.max(20, count * 3);
  });
}
```
**Why:** The PDF tasks us with simulating a heavyweight charting library. Using Angular 22's signal-based `input()` and `computed()` hooks allows the component to react to incoming data changes highly efficiently. This perfectly embodies the "OnPush" signal-first pattern because Angular doesn't need to perform deep object equality checks—it just knows when the Signal notifies it of a change.

## 2. Instructor Dashboard with `@defer`

### The Template (`instructor-dashboard.component.html`)

```html
<!-- Renders instantly on any connection speed -->
<div class="dashboard-header">
  ... (KPI Cards) ...
</div>

<!-- DEFERRED UI: The chart code lives in a separate .js chunk file -->
<div class="chart-section">
  <!-- @defer splits the enclosed component into a separate JavaScript file during the build -->
  <!-- 'on viewport' means the chunk only downloads when this block scrolls into view -->
  <!-- 'prefetch on idle(500)' means the browser will download it quietly in the background if the user is idle -->
  @defer (on viewport; prefetch on idle(500)) {
    <app-analytics-chart [data]="store.entities()" />
  } 
  <!-- @placeholder shows instantly while the chunk is waiting to be triggered -->
  @placeholder {
    <div class="skeleton-chart">Scroll down to view analytics...</div>
  } 
  <!-- @loading shows during the actual network request (minimum 500ms prevents a jarring flash) -->
  @loading (minimum 500ms) {
    <div class="spinner">Downloading chart engine...</div>
  } 
  <!-- @error handles network failures (e.g. going offline) -->
  @error {
    <p>Failed to load chart. Check your connection.</p>
  }
</div>
```
**Why:** This solves the primary performance problem outlined in the PDF: forcing users on slow 3G connections to wait for heavy charting libraries to download before seeing critical text metrics. The `@defer` block creates a physical boundary that Webpack/Vite respects, splitting the chart into `chunk-XXXX.js`.

### The Component logic (`instructor-dashboard.component.ts`)

```typescript
// We must import the AnalyticsChartComponent to use it in the template
import { AnalyticsChartComponent } from '../../ui/analytics-chart/analytics-chart.component';

@Component({
  selector: 'app-instructor-dashboard',
  // Because it's standalone, we must declare our imports.
  // Angular's compiler is smart enough to know that because it's only used inside @defer, 
  // it shouldn't pull this import into the main bundle.
  imports: [AnalyticsChartComponent], 
  // ...
})
export class InstructorDashboardComponent implements OnInit {
  // Inject the store directly to access the data without constructor boilerplate
  store = inject(EnrollmentStore);

  ngOnInit() {
    this.store.loadEnrollments();
  }
}
```

## 3. Application Routing (`app.routes.ts`)

```typescript
  {
    path: 'dashboard',
    // loadComponent creates a lazy-loaded route. 
    // This creates the first layer of code splitting.
    loadComponent: () =>
      import('./features/instructor-dashboard/instructor-dashboard.component').then(
        (m) => m.InstructorDashboardComponent,
      ),
  },
```
**Why:** Changing the route ensures that when you visit `/dashboard`, you are greeted with the new instructor command center. Combined with the `@defer` block inside the dashboard, you now have two layers of lazy loading: the Route loads the dashboard, and the viewport triggers the chart.

## 4. Enrollment List Material Data Grid (`enrollment-list.component.ts`)

### The TypeScript Logic

```typescript
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
// ...

export class EnrollmentListComponent {
  store = inject(EnrollmentStore);
  // Defines the order and presence of columns in the HTML table
  displayedColumns = ['studentName', 'courseName', 'status', 'actions'];

  // MatTableDataSource acts as a bridge between raw data arrays and Material's filtering/sorting/pagination logic
  dataSource = new MatTableDataSource<Enrollment>();

  // viewChild.required() is the modern replacement for @ViewChild.
  // It returns a Signal that contains the reference to the MatPaginator and MatSort directives in the template.
  readonly paginator = viewChild.required(MatPaginator);
  readonly sort = viewChild.required(MatSort);

  constructor() {
    // effect() runs whenever the Signals inside it change.
    // Every time the store's entity array changes, we push the fresh data into the Material data source.
    effect(() => {
      this.dataSource.data = this.store.entities();
    });

    // We assign the paginator and sort objects once they become available.
    // Because they are Signals, this effect naturally waits until Angular resolves the template queries.
    effect(() => {
      this.dataSource.paginator = this.paginator();
      this.dataSource.sort = this.sort();
    });

    this.store.loadEnrollments();
  }
}
```

### The HTML Template (`enrollment-list.component.html`)

```html
<!-- We bind our dataSource object to the table. matSort enables clicking headers to sort -->
<table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z8">
  
  <!-- Each column is defined inside an ng-container with a specific matColumnDef name -->
  <ng-container matColumnDef="studentName">
    <!-- *matHeaderCellDef provides the template for the top header. mat-sort-header adds the interactive arrow. -->
    <th mat-header-cell *matHeaderCellDef mat-sort-header>Student</th>
    <!-- *matCellDef provides the template for the data rows, exposing the current 'row' object -->
    <td mat-cell *matCellDef="let row">{{ row.studentName }}</td>
  </ng-container>

  <!-- ... (other columns) ... -->

  <!-- These two tr tags actually render the rows by looping over our displayedColumns array -->
  <!-- They consume the ng-containers defined above to build the final DOM -->
  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
</table>

<!-- The paginator component automatically hooks into the dataSource via the effect() in our TS -->
<mat-paginator 
  [pageSizeOptions]="[10, 25, 50]" 
  showFirstLastButtons>
</mat-paginator>
```
**Why:** While the original `@for` card layout was fine for a few records, an enterprise application needs sorting, pagination, and accessibility. Material uses `*matHeaderCellDef` and `*matCellDef` structural directives to manage its internal rendering loop rather than the standard `@for`, which enables the built-in virtual scrolling and sorting natively without custom logic.
