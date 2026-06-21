import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {Header} from '../header/header';
import {BottomNavbar} from '../bottom-navbar/bottom-navbar';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule, Header, BottomNavbar],
  templateUrl: './booking-confirmation.html',
  styleUrl: './booking-confirmation.scss'
})
export class BookingConfirmation implements OnInit {

  booking: any;

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    this.booking = history.state.bookingData;

    if (!this.booking) {
      this.router.navigate(['/field-schedule']);
    }
  }

  editBooking(): void {
    this.router.navigate(['/field-schedule']);
  }

  continueToPayment(): void {
    this.router.navigate(['/payment-selection'])
    console.log('Ir a pagar');
  }
}
