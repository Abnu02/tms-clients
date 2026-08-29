import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" aria-live="polite" aria-atomic="true">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [ngClass]="'toast-' + toast.type">
          <div class="toast-icon">
            @switch (toast.type) {
              @case ('success') { <span>✓</span> }
              @case ('error') { <span>✕</span> }
              @case ('warning') { <span>⚠</span> }
              @default { <span>ℹ</span> }
            }
          </div>
          <div class="toast-content">
            @if (toast.title) {
              <div class="toast-title">{{ toast.title }}</div>
            }
            <div class="toast-message">{{ toast.message }}</div>
          </div>
          <button type="button" class="toast-close" (click)="toastService.dismiss(toast.id)" aria-label="Close">
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 400px;
      pointer-events: none;
    }

    .toast {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: 8px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      color: #fff;
      font-size: 0.9rem;
      line-height: 1.4;
      animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      backdrop-filter: blur(8px);
    }

    .toast-success {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      border-left: 4px solid #34d399;
    }

    .toast-error {
      background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
      border-left: 4px solid #f87171;
    }

    .toast-warning {
      background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
      border-left: 4px solid #fbbf24;
      color: #1f2937;
    }

    .toast-info {
      background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
      border-left: 4px solid #60a5fa;
    }

    .toast-icon {
      font-weight: 700;
      font-size: 1.1rem;
      line-height: 1;
    }

    .toast-content {
      flex: 1;
    }

    .toast-title {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .toast-message {
      opacity: 0.95;
    }

    .toast-close {
      background: transparent;
      border: none;
      color: inherit;
      opacity: 0.7;
      cursor: pointer;
      font-size: 0.875rem;
      padding: 0;
      line-height: 1;
      transition: opacity 0.15s;

      &:hover {
        opacity: 1;
      }
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
