import { Component } from '@angular/core';
import {Header} from '../header/header';
import {BottomNavbar} from '../bottom-navbar/bottom-navbar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-booking',
  imports: [Header, BottomNavbar],
  templateUrl: './booking.html',
  styleUrl: './booking.scss',
})
export class Booking {

  constructor(
    private router: Router
  ) {}

  goToFieldSchedule() {
    this.router.navigate(['/field-schedule']);
  }

}
