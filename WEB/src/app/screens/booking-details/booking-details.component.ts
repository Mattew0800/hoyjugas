import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {BookingListDTO} from '../../models/booking.model';
import {Header} from '../header/header';
import {BottomNavbar} from '../bottom-navbar/bottom-navbar';

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [CommonModule, Header, BottomNavbar],
  templateUrl: './booking-details.component.html',
  styleUrl: './booking-details.component.scss'
})
export class BookingDetailsComponent {
  booking: BookingListDTO | null;
  startLabel = '';
  endLabel = '';

  constructor(private router: Router) {
    this.booking = (history.state?.booking as BookingListDTO | undefined) ?? null;

    if (!this.booking) {
      this.router.navigate(['/my-bookings']);
      return;
    }

    this.startLabel = this.formatDateTime(this.booking.startDatetime);
    this.endLabel = this.formatDateTime(this.booking.endDatetime);
  }

  private formatDateTime(value: string | Date): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  }
}
