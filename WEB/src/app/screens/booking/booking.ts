import { Component } from '@angular/core';
import { Header } from '../header/header';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking',
  imports: [
    Header,
    BottomNavbar,
    CommonModule
  ],
  templateUrl: './booking.html',
  styleUrl: './booking.scss',
})
export class Booking {

  selectedFieldType: 'futbol5' | 'futbol7' = 'futbol5';

  selectedDate: Date = new Date();

  constructor(
    private router: Router
  ) {}

  selectFieldType(type: 'futbol5' | 'futbol7'): void {
    this.selectedFieldType = type;
  }

  onDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    if (value) {
      this.selectedDate = new Date(value);
    }
  }

  goToFieldSchedule(): void {
    this.router.navigate(['/field-schedule']);
  }
}
