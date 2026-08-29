import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = signal<ToastMessage[]>([]);

  show(type: ToastMessage['type'], message: string, title?: string, duration = 4000) {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, type, message, title, duration };

    this.toasts.update((current) => [...current, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }

  success(message: string, title = 'Success') {
    this.show('success', message, title);
  }

  error(message: string, title = 'Error') {
    this.show('error', message, title, 6000);
  }

  warning(message: string, title = 'Warning') {
    this.show('warning', message, title, 5000);
  }

  info(message: string, title = 'Info') {
    this.show('info', message, title);
  }

  dismiss(id: string) {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
