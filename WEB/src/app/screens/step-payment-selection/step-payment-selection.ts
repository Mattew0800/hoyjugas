import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
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
export class StepPaymentSelection implements OnInit, OnDestroy {

  private router = inject(Router);
  private bookingState = inject(BookingStateService);
  private bookingService = inject(BookingService);
  private readonly destroy$ = new Subject<void>();

  paymentOptions: PaymentOption[] = [];
  selectedPayment: PaymentOption = { id: '', title: '', description: '', amount: 0 };
  selectedFieldText = 'Cargando...';
  fieldName = '';

  ngOnInit(): void {
    this.bookingState.draft$
      .pipe(takeUntil(this.destroy$))
      .subscribe((draft) => {
        this.fieldName = [draft.spaceName, draft.spaceType].filter(Boolean).join(' • ') || 'Cancha';
        this.selectedFieldText = this.formatSelectedDateTime(draft.startDateTime);
        this.refreshPaymentOptions();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private refreshPaymentOptions(): void {
    const draft = this.bookingState.snapshot;
    const totalAmount = draft.slotPrice ?? 0;
    const partialAmount = draft.spaceDeposit != null
      ? Math.min(draft.spaceDeposit, totalAmount)
      : totalAmount;

    this.paymentOptions = [
      {
        id: 'full',
        title: 'Pagar Total (100%)',
        description: 'Turno abonado por completo',
        amount: totalAmount,
      },
      {
        id: 'partial',
        title: 'Pagar Seña',
        description: 'Resto del pago en el complejo',
        amount: partialAmount,
      },
    ];

    this.selectedPayment = this.paymentOptions[0] ?? { id: '', title: '', description: '', amount: 0 };
  }

  selectPayment(option: PaymentOption): void {
    this.selectedPayment = option;
  }

  // ── Formato de fecha y hora ───────────────────────────────────────
  private formatSelectedDateTime(dateTimeString: string | null): string {
    if (!dateTimeString) return 'Selecciona un horario';

    const normalized = dateTimeString.includes('T') ? dateTimeString : `${dateTimeString}T00:00:00`;
    const [datePart, timePart] = normalized.split('T');
    const [year, month, day] = datePart.split('-').map(Number);

    if (!year || !month || !day) return 'Selecciona un horario';

    const date = new Date(year, month - 1, day);
    const weekday = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][date.getDay()];
    const monthName = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][date.getMonth()];

    const timeLabel = timePart ? timePart.substring(0, 5) + ' hs' : '';
    return timeLabel
      ? `${weekday} ${day} de ${monthName} · ${timeLabel}`
      : `${weekday} ${day} de ${monthName}`;
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
    if (!this.selectedPayment || !this.selectedPayment.id) return;

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
