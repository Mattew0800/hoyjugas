import { Component, OnInit } from '@angular/core';
import { Header } from '../header/header';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface DateOption {
  value: Date;
  day: number;
  month: string;
  availableSlots: number;
}

@Component({
  selector: 'app-field-schedule',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    Header,
    BottomNavbar
  ],
  templateUrl: './field-schedule.html',
  styleUrl: './field-schedule.scss'
})
export class FieldSchedule implements OnInit {

  selectedDate!: Date;
  selectedHour = '13:00';

  visibleDates: DateOption[] = [];

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    this.selectedDate = new Date();
    this.generateVisibleDates(this.selectedDate);
  }

  generateVisibleDates(baseDate: Date): void {

    this.visibleDates = [];

    for (let i = 0; i < 5; i++) {

      const date = new Date(baseDate);

      date.setDate(baseDate.getDate() + i);

      this.visibleDates.push({
        value: date,
        day: date.getDate(),
        month: date.toLocaleDateString('es-AR', {
          month: 'short'
        }).replace('.', '').toUpperCase(),
        availableSlots: [8, 5, 12, 3, 10][i]
      });
    }
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
  }

  onDateChange(event: Event): void {

    const value = (event.target as HTMLInputElement).value;

    if (!value) return;

    const newDate = new Date(value);

    this.selectedDate = newDate;

    this.generateVisibleDates(newDate);
  }

  timeSlots = [
    { hour: '08:00', available: true },
    { hour: '09:00', available: true },
    { hour: '10:00', available: true },
    { hour: '11:00', available: true },
    { hour: '12:00', available: true },
    { hour: '13:00', available: true },
    { hour: '14:00', available: true },
    { hour: '15:00', available: true },
    { hour: '16:00', available: true },
    { hour: '17:00', available: true },
    { hour: '18:00', available: true },
    { hour: '19:00', available: true },
    { hour: '20:00', available: false },
    { hour: '21:00', available: false },
    { hour: '22:00', available: true }
  ];

  selectHour(hour: string): void {

    const slot = this.timeSlots.find(
      slot => slot.hour === hour
    );

    if (!slot?.available) {
      return;
    }

    this.selectedHour = hour;
  }

  reserve(): void {

    this.router.navigate(
      ['/booking-confirmation'],
      {
        state: {
          bookingData: {
            fieldName: 'Cancha 1 - Fútbol 5 (Techada)',
            date: this.selectedDate.toLocaleDateString('es-AR'),
            startTime: this.selectedHour,
            endTime: this.calculateEndTime(this.selectedHour),
            userName: 'Martín',
            price: 8000
          }
        }
      }
    );
  }

  private calculateEndTime(startHour: string): string {

    const [hours, minutes] = startHour.split(':').map(Number);

    const endHour = hours + 1;

    return `${endHour.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
  }
}
