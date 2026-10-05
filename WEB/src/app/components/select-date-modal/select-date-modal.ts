import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CalendarDay {
  day: number | null;
  hasSlots: boolean;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS_WITH_SLOTS = new Set([15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]);

@Component({
  selector: 'app-select-date-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-date-modal.html',
  styleUrl: './select-date-modal.scss',
})
export class SelectDateModal {

  @Input() isClosing = false;
  @Output() onClose   = new EventEmitter<void>();
  @Output() onConfirm = new EventEmitter<string>();

  // ── Estado del calendario ─────────────────────────────────────────
  private today = new Date();
  currentYear  = this.today.getFullYear();
  currentMonth = this.today.getMonth();

  selectedDay: number | null = 15;

  get monthLabel(): string {
    return `${MONTH_NAMES[this.currentMonth]} ${this.currentYear}`;
  }

  get calendarDays(): CalendarDay[] {
    const firstWeekday = new Date(this.currentYear, this.currentMonth, 1).getDay();

    const offset = (firstWeekday === 0 ? 6 : firstWeekday - 1);

    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    const cells: CalendarDay[] = [];

    for (let i = 0; i < offset; i++) {
      cells.push({ day: null, hasSlots: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, hasSlots: DAYS_WITH_SLOTS.has(d) });
    }

    return cells;
  }

  isPast(day: number): boolean {
    const cellDate = new Date(this.currentYear, this.currentMonth, day);
    const todayMidnight = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
    return cellDate < todayMidnight;
  }

  isSelected(day: number): boolean {
    return this.selectedDay === day;
  }

  // ── Interacción ───────────────────────────────────────────────────
  selectDay(day: number | null): void {
    if (day === null || this.isPast(day)) return;
    this.selectedDay = day;
  }

  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.selectedDay = null;
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.selectedDay = null;
  }

  // ── Emisión ───────────────────────────────────────────────────────
  close(): void {
    this.onClose.emit();
  }

  confirm(): void {
    if (!this.selectedDay) return;
    const label = `${this.selectedDay} de ${MONTH_NAMES[this.currentMonth]} ${this.currentYear}`;
    this.onConfirm.emit(label);
    this.close();
  }
}
