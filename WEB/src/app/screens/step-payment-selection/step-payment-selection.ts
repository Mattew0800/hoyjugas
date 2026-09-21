import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../header/header';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';

import { BookingStateService } from '../../services/BookingStateService/booking-state-service';
import { BookingService } from '../../services/BookingService/booking-service';

export interface PaymentOption {
  id: string;
  title: string;
  description: string;
  amount: number;
}

@Component({
  selector: 'app-step-payment-selection',
  standalone: true,
  imports: [CommonModule, Header, BottomNavbar],
  templateUrl: './step-payment-selection.html',
  styleUrl: './step-payment-selection.scss',
})
export class StepPaymentSelection {

  private router = inject(Router);
  private bookingState = inject(BookingStateService);
  private bookingService = inject(BookingService);

  // ── Opciones de pago ──────────────────────────────────────────────
  paymentOptions: PaymentOption[] = [
    {
      id: 'full',
      title: 'Pagar Total (100%)',
      description: 'Turno abonado por completo',
      amount: 20000,
    },
    {
      id: 'partial',
      title: 'Pagar Seña (50%)',
      description: 'Resto del pago en el complejo',
      amount: 10000,
    },
  ];

  // Preseleccionar la primera opción (pago total) al entrar al paso
  selectedPayment: PaymentOption = this.paymentOptions[0];

  selectPayment(option: PaymentOption): void {
    this.selectedPayment = option;
  }

  // ── Formato de moneda ─────────────────────────────────────────────
  formatAmount(amount: number): string {
    return `$${amount.toLocaleString('es-AR')}`;
  }

  // ── Navegación y Confirmación Final ───────────────────────────────
  goBack(): void {
    this.router.navigate(['/field-schedule/date-selection']);
  }

  confirmBooking(): void {
    if (!this.selectedPayment) return;

    const draft = this.bookingState.snapshot;

    if (!draft.spaceId || !draft.startDateTime) {
      this.goBack();
      return;
    }

    const bookingRequest = {
      spaceId: draft.spaceId,
      startDatetime: draft.startDateTime,
      paymentMethod: 'MERCADOPAGO' as const,
      termsAccepted: true,
      depositAmount: this.selectedPayment.amount,
      slots: draft.slots ?? 1,
    };

    this.bookingState.patch({
      depositAmount: bookingRequest.depositAmount,
      paymentMethod: bookingRequest.paymentMethod,
      termsAccepted: bookingRequest.termsAccepted,
      slots: bookingRequest.slots,
    });

    this.bookingService.createPublicBooking(bookingRequest).subscribe({
      next: () => {
        this.bookingState.reset();
        this.router.navigate(['/booking-success']);
      },
      error: (error) => {
        console.error('No se pudo crear el turno:', error);
        alert(error?.error?.message || 'No se pudo crear el turno.');
      }
    });
  }
}
