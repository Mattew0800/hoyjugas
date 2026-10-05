import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Header } from '../header/header';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';
import { BookingStateService } from '../../services/BookingStateService/booking-state-service';
import {BookingService} from '../../services/BookingService/booking-service';

type Tab = 'mañana' | 'tarde' | 'noche';

interface TimeSlot {
  label: string;
  disabled: boolean;
}

const DEFAULT_SLOTS: Record<Tab, TimeSlot[]> = {
  mañana: [
    { label: '09:00', disabled: false },
    { label: '10:00', disabled: false },
    { label: '11:00', disabled: true  },
    { label: '12:00', disabled: false },
  ],
  tarde: [
    { label: '13:00', disabled: false },
    { label: '14:00', disabled: false },
    { label: '15:00', disabled: false },
    { label: '16:00', disabled: true  },
    { label: '17:00', disabled: false },
    { label: '18:00', disabled: true  },
  ],
  noche: [
    { label: '19:00', disabled: false },
    { label: '20:00', disabled: false },
    { label: '21:00', disabled: true  },
    { label: '22:00', disabled: false },
  ],
};

@Component({
  selector: 'app-step-time-selection',
  standalone: true,
  imports: [CommonModule, Header, BottomNavbar],
  templateUrl: './step-time-selection.html',
  styleUrl: './step-time-selection.scss',
})
export class StepTimeSelection implements OnInit, OnDestroy {

  activeTab: Tab = 'tarde';
  tabs: Tab[] = ['mañana', 'tarde', 'noche'];
  selectedSlot: TimeSlot | null = null;
  selectedDateText = 'Selecciona una fecha';
  allSlots: Record<Tab, TimeSlot[]> = {
    mañana: DEFAULT_SLOTS.mañana.map(slot => ({ ...slot })),
    tarde: DEFAULT_SLOTS.tarde.map(slot => ({ ...slot })),
    noche: DEFAULT_SLOTS.noche.map(slot => ({ ...slot })),
  };

  private bookingStateService = inject(BookingStateService);
  private readonly destroy$ = new Subject<void>();
  bookingService = inject(BookingService);

  constructor(private router: Router) {}

  ngOnInit() {
    this.bookingStateService.draft$
      .pipe(takeUntil(this.destroy$))
      .subscribe((draft) => {
        this.selectedDateText = this.formatSelectedDate(draft.startDateTime);
        if (draft.spaceId && draft.startDateTime) {
          this.getAvailability();
        } else {
          this.resetSlots();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get currentSlots(): TimeSlot[] {
    return this.allSlots[this.activeTab];
  }

  selectTab(tab: Tab): void {
    this.activeTab = tab;
  }

  selectSlot(slot: TimeSlot): void {
    if (slot.disabled) return;
    this.selectedSlot = slot;
  }

  goToPayment(): void {
    if (!this.selectedSlot) return;


    const draft = this.bookingStateService.snapshot;
    const savedDate = draft.startDateTime;


    if (!savedDate) {
      this.goBack();
      return;
    }


    const fullLocalDateTime = `${savedDate}T${this.selectedSlot.label}:00`;


    this.bookingStateService.patch({ startDateTime: fullLocalDateTime });


    this.router.navigate(['/field-schedule/payment-selection']);
  }

  goBack(): void {
    this.router.navigate(['/field-schedule']);
  }

  capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  private formatSelectedDate(dateString: string | null): string {
    if (!dateString) {
      return 'Selecciona una fecha';
    }

    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) {
      return 'Selecciona una fecha';
    }

    const date = new Date(year, month - 1, day);
    const weekday = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][date.getDay()];
    const monthName = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][date.getMonth()];

    return `${weekday} ${day} de ${monthName}`;
  }

  private resetSlots(): void {
    this.allSlots = {
      mañana: DEFAULT_SLOTS.mañana.map(slot => ({ ...slot })),
      tarde: DEFAULT_SLOTS.tarde.map(slot => ({ ...slot })),
      noche: DEFAULT_SLOTS.noche.map(slot => ({ ...slot })),
    };
    this.selectedSlot = null;
  }

  private toHourLabel(dateValue: string): string | null {
    if (!dateValue) return null;

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return null;

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private buildAvailabilityFromResponse(response: Array<{ startDatetime: string; available: boolean }>): Record<Tab, TimeSlot[]> {
    const availableByLabel = new Map<string, boolean>();

    response.forEach((slot) => {
      const label = this.toHourLabel(slot.startDatetime);
      if (!label) return;
      availableByLabel.set(label, slot.available);
    });

    return {
      mañana: DEFAULT_SLOTS.mañana.map((slot) => ({
        ...slot,
        disabled: !(availableByLabel.get(slot.label) ?? false),
      })),
      tarde: DEFAULT_SLOTS.tarde.map((slot) => ({
        ...slot,
        disabled: !(availableByLabel.get(slot.label) ?? false),
      })),
      noche: DEFAULT_SLOTS.noche.map((slot) => ({
        ...slot,
        disabled: !(availableByLabel.get(slot.label) ?? false),
      })),
    };
  }

  getAvailability(): void {
    const draft = this.bookingStateService.snapshot;

    if (!draft.spaceId || !draft.startDateTime) {
      this.resetSlots();
      return;
    }

    const dateOnly = draft.startDateTime.includes('T')
      ? draft.startDateTime.split('T')[0]
      : draft.startDateTime;

    this.bookingService.getAvailability(draft.spaceId, dateOnly).subscribe({
      next: (slots) => {
        this.allSlots = this.buildAvailabilityFromResponse(slots);
        if (this.selectedSlot && this.allSlots[this.activeTab].some(slot => slot.label === this.selectedSlot?.label && !slot.disabled)) {
          return;
        }
        this.selectedSlot = null;
      },
      error: () => {
        this.resetSlots();
      }
    });
  }

}
