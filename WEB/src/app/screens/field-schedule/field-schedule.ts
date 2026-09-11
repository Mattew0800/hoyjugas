import { Component } from '@angular/core';
import { Header } from '../header/header';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SelectDateModal } from '../../components/select-date-modal/select-date-modal';

export interface DateCard {
  label: string;    // 'HOY' | 'AGO' | etc.
  day: number;
  slots: number | null; // null = sin disponibilidad
}

@Component({
  selector: 'app-field-schedule',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    Header,
    BottomNavbar,
    SelectDateModal
  ],
  templateUrl: './field-schedule.html',
  styleUrl: './field-schedule.scss'
})
export class FieldSchedule {

  // ── Estado del modal ──────────────────────────────────────────────
  isModalOpen = false;
  isClosing   = false;

  // ── Datos de fechas ───────────────────────────────────────────────
  dates: DateCard[] = [
    { label: 'HOY', day: 15, slots: 2 },
    { label: 'AGO', day: 16, slots: 6 },
    { label: 'AGO', day: 17, slots: null },
    { label: 'AGO', day: 18, slots: 8 },
    { label: 'AGO', day: 19, slots: 7 },
    { label: 'AGO', day: 20, slots: 8 },
    { label: 'AGO', day: 21, slots: 8 },
  ];

  selectedDate: DateCard | null = null;

  constructor(private router: Router) {}

  // ── Selección de fecha ────────────────────────────────────────────
  selectDate(date: DateCard): void {
    if (date.slots === null) return; // ignorar fechas agotadas
    this.selectedDate = date;
  }

  // ── Continuar con validación ──────────────────────────────────────
  goToTimeSelection(): void {
    if (!this.selectedDate) return;
    this.router.navigate(['/field-schedule/date-selection']);
  }

  // ── Modal ─────────────────────────────────────────────────────────
  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isClosing = true;
    setTimeout(() => {
      this.isModalOpen = false;
      this.isClosing = false;
    }, 600);
  }

  handleDateConfirmed(date: string): void {
    // TODO: parsear la fecha seleccionada desde el modal y sincronizarla
    this.isModalOpen = false;
  }
}
