import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="unauthorized-container" style="text-align: center; padding: 3rem;">
      <h1>403 - Unauthorized</h1>
      <p>You do not have permission to view this resource.</p>
      <a routerLink="/dashboard" style="display: inline-block; margin-top: 1rem; color: #3b82f6;">Return to Dashboard</a>
    </div>
  `,
})
export class UnauthorizedComponent {}
