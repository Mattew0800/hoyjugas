import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { BottomNavbar } from '../bottom-navbar/bottom-navbar';
import { Header } from '../header/header';

@Component({
  selector: 'app-home',
  imports: [BottomNavbar, Header],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

  availableTurns: number = 3;

  closingHour: string = '23:00';

  constructor(private router: Router) {}

  goToBooking() {
    this.router.navigate(['/booking']);
  }

}
