import {Component, inject, OnInit} from '@angular/core';
import { Header } from '../header/header';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SelectDateModal } from '../../components/select-date-modal/select-date-modal';
import {BookingStateService} from '../../services/BookingStateService/booking-state-service';
import {BookingService} from '../../services/BookingService/booking-service';
import {DailyAvailabilityDTO} from '../../models/DailyAvailabilityDTO';

export interface DateCard {
  label: string;    // 'HOY' | 'AGO' | etc.
  day: number;
  slots: number | null; // null = sin disponibilidad
  month: number;
  year: number;
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
export class FieldSchedule implements OnInit {

  // ── Estado del modal ──────────────────────────────────────────────
  isModalOpen = false;
  isClosing   = false;

  // ── Datos de fechas ───────────────────────────────────────────────
  dates: DateCard[] = [];
  selectedMoreDate: DateCard | null = null;
  selectedDate: DateCard | null = null;

  // ── Estado de carga ───────────────────────────────────────────────
  isLoading = true;
  loadError = false;

  /** Respuesta completa del backend (30 días) para consultas del modal */
  private availabilityIndex = new Map<string, number>();

  private bookingState  = inject(BookingStateService);
  private bookingService = inject(BookingService);

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.bookingService.availabilityNext30Days().subscribe({
      next: (response) => {
        // Indexamos por fecha normalizada para búsquedas O(1) en el modal
        this.availabilityIndex.clear();
        response.days.forEach(d => {
          const key = this.toDateKey(d.date);
          this.availabilityIndex.set(key, d.availableSlots);
        });

        this.dates = this.buildDatesFromResponse(response.days);
        this.isLoading = false;
      },
      error: () => {
        // Fallback: mostrar los próximos 7 días vacíos con error
        this.dates = this.buildFallbackDates();
        this.isLoading = false;
        this.loadError = true;
      }
    });
  }

  private readonly monthLabels = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

  /**
   * Normaliza cualquier formato de fecha del backend ("2026-09-25" o "2026-09-25T00:00:00")
   * a una clave uniforme "YYYY-MM-DD" para el Map de búsqueda.
   */
  private toDateKey(dateStr: string): string {
    return dateStr.substring(0, 10);
  }

  /** Construye las DateCards para los primeros 7 días usando la respuesta real de la API */
  private buildDatesFromResponse(days: DailyAvailabilityDTO[]): DateCard[] {
    const today = new Date();
    const todayKey = this.toDateKey(today.toISOString());
    const cards: DateCard[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

      const available = this.availabilityIndex.get(key) ?? null;

      cards.push({
        label: i === 0 ? 'HOY' : this.monthLabels[date.getMonth()],
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        slots: available !== null && available > 0 ? available : (available === 0 ? null : null),
      });
    }

    return cards;
  }

  /** Fallback en caso de error de red: 7 días sin datos de slots */
  private buildFallbackDates(): DateCard[] {
    const today = new Date();
    const cards: DateCard[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      cards.push({
        label: i === 0 ? 'HOY' : this.monthLabels[date.getMonth()],
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        slots: null,
      });
    }

    return cards;
  }

  /** Consulta el índice de disponibilidad para una fecha dada */
  private getSlotsForDate(year: number, month: number, day: number): number | null {
    const key = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const slots = this.availabilityIndex.get(key);
    if (slots === undefined) return null;
    return slots > 0 ? slots : null; // 0 slots → agotado
  }

  // ── Selección de fecha ────────────────────────────────────────────
  selectDate(date: DateCard): void {
    if (date.slots === null) return; // ignorar fechas agotadas
    this.selectedDate = date;
  }


  goToTimeSelection(): void {
    if (!this.selectedDate) return;

    const yearMonth = `${this.selectedDate.year}-${(this.selectedDate.month + 1).toString().padStart(2, '0')}`;
    const day = this.selectedDate.day.toString().padStart(2, '0');
    const dateOnlyString = `${yearMonth}-${day}`;


    this.bookingState.patch({ startDateTime: dateOnlyString });


    this.router.navigate(['/field-schedule/time-selection']);
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
    const parsedDate = this.parseSpanishDate(date);
    if (!parsedDate) {
      this.isModalOpen = false;
      return;
    }

    const selectedDateValue = new Date(parsedDate.year, parsedDate.month, parsedDate.day);
    if (this.isPastDate(selectedDateValue)) {
      this.isModalOpen = false;
      return;
    }

    const existingDate = this.dates.find((item) =>
      item.day === parsedDate.day &&
      item.month === parsedDate.month &&
      item.year === parsedDate.year
    );

    if (existingDate) {
      if (existingDate.slots === null) {
        this.isModalOpen = false;
        return;
      }
      this.selectedDate = existingDate;
      this.isModalOpen = false;
      return;
    }

    const slots = this.getSlotsForDate(parsedDate.year, parsedDate.month, parsedDate.day);

    if (slots === null) {
      // Fecha fuera del rango de 30 días o sin disponibilidad — no seleccionar
      this.isModalOpen = false;
      return;
    }

    this.selectedMoreDate = {
      label: this.monthLabels[parsedDate.month],
      day: parsedDate.day,
      month: parsedDate.month,
      year: parsedDate.year,
      slots,
    };
    this.selectedDate = this.selectedMoreDate;
    this.isModalOpen = false;
  }

  private parseSpanishDate(input: string): { day: number; month: number; year: number } | null {
    const match = input.match(/^(\d{1,2}) de ([A-Za-zÁÉÍÓÚáéíóúñÑ]+) (\d{4})$/);
    if (!match) return null;

    const day = Number(match[1]);
    const monthName = this.normalizeText(match[2]);
    const year = Number(match[3]);

    const monthMap: Record<string, number> = {
      enero: 0,
      febrero: 1,
      marzo: 2,
      abril: 3,
      mayo: 4,
      junio: 5,
      julio: 6,
      agosto: 7,
      septiembre: 8,
      setiembre: 8,
      octubre: 9,
      noviembre: 10,
      diciembre: 11,
    };

    const month = monthMap[monthName];
    if (month === undefined || day < 1 || day > 31) return null;

    return { day, month, year };
  }

  private isPastDate(date: Date): boolean {
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return dateMidnight < todayMidnight;
  }

  private normalizeText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }




}
