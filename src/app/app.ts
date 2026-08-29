import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EnrollmentStore } from './store/enrollment.store';
import { NavbarComponent } from './ui/navbar/navbar.component';
import { ToastComponent } from './ui/toast/toast.component';
import { SecurityPlaygroundComponent } from './ui/security-playground/security-playground.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, ToastComponent, SecurityPlaygroundComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('tms-clients');
  private store = inject(EnrollmentStore);

  ngOnInit() {
    this.store.loadEnrollments();
    this.store.listenForLiveUpdates();
  }
}
