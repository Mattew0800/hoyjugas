import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../header/header';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';

type Tab = 'mañana' | 'tarde' | 'noche';

interface TimeSlot {
  label: string;
  disabled: boolean;
}

const ALL_SLOTS: Record<Tab, TimeSlot[]> = {
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
export class StepTimeSelection {

  // ── Estado de tabs ────────────────────────────────────────────────
  activeTab: Tab = 'tarde';
  tabs: Tab[] = ['mañana', 'tarde', 'noche'];

  // ── Estado de selección ───────────────────────────────────────────
  selectedSlot: TimeSlot | null = null;

  constructor(private router: Router) {}

  // ── Slots visibles según tab activo ───────────────────────────────
  get currentSlots(): TimeSlot[] {
    return ALL_SLOTS[this.activeTab];
  }

  selectTab(tab: Tab): void {
    this.activeTab = tab;
    this.selectedSlot = null; // limpiar selección al cambiar tab
  }

  selectSlot(slot: TimeSlot): void {
    if (slot.disabled) return;
    this.selectedSlot = slot;
  }

  // ── Navegación con validación ─────────────────────────────────────
  goToPayment(): void {
    if (!this.selectedSlot) return;
    this.router.navigate(['/field-schedule/payment-selection']);
  }

  goBack(): void {
    this.router.navigate(['/field-schedule']);
  }

  // ── Helper para capitalizar el label del tab ──────────────────────
  capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
