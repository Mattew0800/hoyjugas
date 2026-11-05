
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  Subject,
  takeUntil,
  timer,
  switchMap,
  filter,
  take,
  of,
  catchError,
} from 'rxjs';

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
  selectedPayment: PaymentOption = {
    id: '',
    title: '',
    description: '',
    amount: 0,
  };

  selectedFieldText = 'Cargando...';
  fieldName = '';
  isProcessing = false;

  private paymentWindow: Window | null = null;

  ngOnInit(): void {
    this.bookingState.draft$
      .pipe(takeUntil(this.destroy$))
      .subscribe((draft) => {
        this.fieldName = [draft.spaceName, draft.spaceType]
          .filter(Boolean)
          .join(' • ') || 'Cancha';

        this.selectedFieldText = this.formatSelectedDateTime(
          draft.startDateTime
        );

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

    this.selectedPayment = this.paymentOptions[0] ?? {
      id: '',
      title: '',
      description: '',
      amount: 0,
    };
  }

  selectPayment(option: PaymentOption): void {
    if (this.isProcessing) return;
    this.selectedPayment = option;
  }

  // ── Formato de fecha y hora ───────────────────────────────────────

  private formatSelectedDateTime(dateTimeString: string | null): string {
    if (!dateTimeString) return 'Selecciona un horario';

    const normalized = dateTimeString.includes('T')
      ? dateTimeString
      : `${dateTimeString}T00:00:00`;

    const [datePart, timePart] = normalized.split('T');
    const [year, month, day] = datePart.split('-').map(Number);

    if (!year || !month || !day) {
      return 'Selecciona un horario';
    }

    const date = new Date(year, month - 1, day);

    const weekday = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ][date.getDay()];

    const monthName = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ][date.getMonth()];

    const timeLabel = timePart
      ? timePart.substring(0, 5) + ' hs'
      : '';

    return timeLabel
      ? `${weekday} ${day} de ${monthName} · ${timeLabel}`
      : `${weekday} ${day} de ${monthName}`;
  }

  // ── Formato de moneda ─────────────────────────────────────────────

  formatAmount(amount: number): string {
    return `$${amount.toLocaleString('es-AR')}`;
  }

  // ── Navegación ────────────────────────────────────────────────────

  goBack(): void {
    if (this.isProcessing) return;

    this.router.navigate(['/field-schedule/date-selection']);
  }

  // ── Confirmación y pago ───────────────────────────────────────────

  confirmBooking(): void {
    if (this.isProcessing) return;

    if (!this.selectedPayment || !this.selectedPayment.id) return;

    const draft = this.bookingState.snapshot;

    if (!draft.spaceId || !draft.startDateTime) {
      this.goBack();
      return;
    }

    const bookingRequest = {
      spaceId: draft.spaceId,
      startDatetime: draft.startDateTime,
      paymentType: this.selectedPayment.id === 'full'
        ? 'PAGO_TOTAL'
        : 'SEÑA',
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

    this.isProcessing = true;

    // IMPORTANTE:
    // Abrimos la ventana durante el clic del usuario,
    // antes de ejecutar cualquier petición HTTP.
    // Esto evita el bloqueo de popups de Safari.

    this.paymentWindow = window.open('about:blank', '_blank');

    // Crear reserva en el backend.

    this.bookingService.createPublicBooking(bookingRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({

        next: (res) => {

          // Verificar que Mercado Pago haya devuelto una URL.

          if (!res.mpUrl) {
            this.paymentWindow?.close();
            this.paymentWindow = null;

            this.isProcessing = false;

            console.error(
              'Mercado Pago no devolvió una URL de pago.'
            );

            return;
          }

          // Navegar la ventana previamente abierta hacia Mercado Pago.

          if (this.paymentWindow && !this.paymentWindow.closed) {

            this.paymentWindow.location.href = res.mpUrl;

          } else {

            // Fallback si Safari bloqueó la ventana emergente.
            // Se utiliza la pestaña actual.

            window.location.assign(res.mpUrl);
            return;
          }

          const bookingId = res.booking.id;

          // Polling cada 3 segundos hasta detectar el pago.

          timer(0, 3000)
            .pipe(
              switchMap(() =>
                this.bookingService.verifyBookingPayment(bookingId).pipe(
                  catchError((err) => {
                    console.warn(
                      'Error temporal verificando estado de pago:',
                      err
                    );

                    return of(null);
                  })
                )
              ),

              filter(
                (statusRes): statusRes is { paymentStatus: string } =>
                  statusRes !== null &&
                  (
                    statusRes.paymentStatus === 'PAGADO' ||
                    statusRes.paymentStatus === 'RESERVADO'
                  )
              ),

              take(1),
              takeUntil(this.destroy$)
            )
            .subscribe({

              next: () => {

                // Cerrar automáticamente la pestaña de Mercado Pago.

                if (
                  this.paymentWindow &&
                  !this.paymentWindow.closed
                ) {
                  this.paymentWindow.close();
                }

                this.paymentWindow = null;

                this.isProcessing = false;

                this.router.navigate(['/booking-success']);
              },

              error: (err) => {
                this.isProcessing = false;

                console.error(
                  'Error al verificar pago:',
                  err
                );
              },

            });
        },

        error: (error) => {

          // Cerrar la pestaña vacía si falla la creación.

          if (this.paymentWindow && !this.paymentWindow.closed) {
            this.paymentWindow.close();
          }

          this.paymentWindow = null;

          this.isProcessing = false;

          console.error('No se pudo crear el turno:', error);

          alert(
            error?.error?.message ||
            'No se pudo crear el turno.'
          );
        },

      });
  }
}
