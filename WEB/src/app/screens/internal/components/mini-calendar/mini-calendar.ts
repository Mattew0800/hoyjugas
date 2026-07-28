import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-mini-calendar',
  standalone: true,
  imports: [],
  templateUrl: './mini-calendar.html',
  styleUrl: './mini-calendar.scss'
})
export class MiniCalendar {

  @Output()
  dateSelected = new EventEmitter<Date>();

  weekDays = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

  currentDate = new Date();

  selectedDay = this.currentDate.getDate();

  days: (number | null)[] = [];

  constructor() {
    this.generateCalendar();

    this.dateSelected.emit(
      new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        this.selectedDay
      )
    );
  }

  get month(): string {
    return this.currentDate.toLocaleDateString('es-AR', {
      month: 'long',
      year: 'numeric'
    });
  }

  previousMonth(): void {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1
    );

    this.selectedDay = 1;
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1
    );

    this.selectedDay = 1;
    this.generateCalendar();
  }

  selectDay(day: number): void {

    this.selectedDay = day;

    const selectedDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      day
    );

    this.dateSelected.emit(selectedDate);

  }

  private generateCalendar(): void {

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const firstWeekDay = (firstDay.getDay() + 6) % 7;

    this.days = [];

    for (let i = 0; i < firstWeekDay; i++) {
      this.days.push(null);
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      this.days.push(d);
    }

    // Si el mes mostrado es el actual, resalta el día de hoy.
    // Si no, selecciona el día 1.
    const today = new Date();

    if (
      today.getFullYear() === year &&
      today.getMonth() === month
    ) {
      this.selectedDay = today.getDate();
    } else {
      this.selectedDay = 1;
    }

  }

}
