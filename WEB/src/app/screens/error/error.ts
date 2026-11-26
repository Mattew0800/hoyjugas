import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location, AsyncPipe } from '@angular/common';
import { map } from 'rxjs';
import { Header } from '../header/header';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';
import { AuthService } from '../../services/AuthService/auth-service';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [
    AsyncPipe,
    Header,
    BottomNavbar,
  ],
  templateUrl: './error.html',
  styleUrl: './error.scss',
})
export class Error {
  private router = inject(Router);
  private location = inject(Location);
  private authService = inject(AuthService);

  email = 'hoyjugassistema@gmail.com';
  subject = 'Reportar error 404';
  body = `Envío este mensaje desde el error 404. Esta página debería funcionar. \n\n URL: ${window.location.href} \n\nMuchas gracias.`;

  mailto = `mailto:${this.email}?subject=${encodeURIComponent(this.subject)}&body=${encodeURIComponent(this.body)}`;


  readonly isLoggedIn$ = this.authService.currentUser$.pipe(
    map((user) => !!user)
  );

  goHome(): void {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/sign-in']);
    }
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.goHome();
    }
  }

  goToBooking(): void {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/booking']);
    } else {
      this.router.navigate(['/sign-in']);
    }
  }

  goToMyBookings(): void {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/my-bookings']);
    } else {
      this.router.navigate(['/sign-in']);
    }
  }

  goToContact(): void {
    this.router.navigate(['/contact']);
  }

  goToLogin(): void {
    this.router.navigate(['/sign-in']);
  }
}
