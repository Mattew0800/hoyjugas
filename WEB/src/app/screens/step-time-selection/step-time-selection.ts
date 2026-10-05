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
  price?: number;
  datetime?: string;
}

const DEFAULT_SLOTS: Record<Tab, TimeSlot[]> = {
  mañana: [
   { label: '09:00', disabled: false },
   { label: '10:00', disabled: false },
   { label: '11:00', disabled: false },
   { label: '12:00', disabled: false },
  ],
  tarde: [
   { label: '13:00', disabled: false },
   { label: '14:00', disabled: false },
   { label: '15:00', disabled: false },
   { label: '16:00', disabled: false },
   { label: '17:00', disabled: false },
   { label: '18:00', disabled: false },
  ],
  noche: [
   { label: '19:00', disabled: false },
   { label: '20:00', disabled: false },
   { label: '21:00', disabled: false },
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
  selectedSlotKey: string | null = null;
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
    this.selectedSlotKey = slot.label;
    this.bookingStateService.patch({
      slotPrice: Number(slot.price ?? 0),
    });
  }

  goToPayment(): void {
    if (!this.selectedSlot) return;

    const draft = this.bookingStateService.snapshot;
    const savedDate = draft.startDateTime;

    if (!savedDate) {
      this.goBack();
      return;
    }

    const fullLocalDateTime = this.selectedSlot.datetime
      ? this.selectedSlot.datetime
      : `${savedDate}T${this.selectedSlot.label}:00`;

    this.bookingStateService.patch({
      startDateTime: fullLocalDateTime,
      slotPrice: Number(this.selectedSlot.price ?? 0),
    });

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

    const normalized = dateString.includes('T') ? dateString.split('T')[0] : dateString;
    const [year, month, day] = normalized.split('-').map(Number);
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
    this.selectedSlotKey = null;
  }

  private getTabForHour(hour: number): Tab {
    if (hour < 12) return 'mañana';
    if (hour < 18) return 'tarde';
    return 'noche';
  }

  private buildAvailabilityFromResponse(response: Array<{ startDatetime: string; available: boolean; price?: number }>): Record<Tab, TimeSlot[]> {
    const availability = new Map<string, { available: boolean; price?: number; datetime?: string }>();

    response.forEach((slot) => {
      if (!slot?.startDatetime) return;
      const date = new Date(slot.startDatetime);
      const label = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      availability.set(label, {
        available: slot.available,
        price: Number(slot.price ?? 0),
        datetime: slot.startDatetime,
      });
    });

    return {
      mañana: DEFAULT_SLOTS.mañana.map((slot) => ({
        ...slot,
        price: availability.get(slot.label)?.price ?? slot.price,
        datetime: availability.get(slot.label)?.datetime ?? slot.datetime,
        disabled: !(availability.get(slot.label)?.available ?? false),
      })),
      tarde: DEFAULT_SLOTS.tarde.map((slot) => ({
        ...slot,
        price: availability.get(slot.label)?.price ?? slot.price,
        datetime: availability.get(slot.label)?.datetime ?? slot.datetime,
        disabled: !(availability.get(slot.label)?.available ?? false),
      })),
      noche: DEFAULT_SLOTS.noche.map((slot) => ({
        ...slot,
        price: availability.get(slot.label)?.price ?? slot.price,
        datetime: availability.get(slot.label)?.datetime ?? slot.datetime,
        disabled: !(availability.get(slot.label)?.available ?? false),
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
        const currentTabOptions = this.allSlots[this.activeTab];

        if (this.selectedSlotKey) {
          const existing = currentTabOptions.find((slot) => slot.label === this.selectedSlotKey && !slot.disabled);
          this.selectedSlot = existing ?? null;
          if (!existing) {
            this.selectedSlotKey = null;
          }
        } else {
          this.selectedSlot = null;
        }

        if (!currentTabOptions.some(slot => !slot.disabled) && this.tabs.some(tab => this.allSlots[tab].some(slot => !slot.disabled))) {
          this.activeTab = this.tabs.find(tab => this.allSlots[tab].some(slot => !slot.disabled)) ?? this.activeTab;
        }
      },
      error: () => {
        this.resetSlots();
      }
    });
  }

}
