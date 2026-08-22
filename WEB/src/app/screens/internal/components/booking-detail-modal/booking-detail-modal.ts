import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BookingListModel } from '../../models/booking-list.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../../services/BookingService/booking-service';

@Component({
  selector: 'app-booking-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './booking-detail-modal.html',
  styleUrl: './booking-detail-modal.scss'
})
export class BookingDetailModal {

  @Input({ required: true })
  booking!: BookingListModel;

  @Output()
  close = new EventEmitter<void>();

  @Output()
  confirmPayment = new EventEmitter<BookingListModel>();

  @Output()
  bookingCancelled = new EventEmitter<void>();

  showCancelForm = false;

  cancellationReason = '';

  employeePin = '';

  cancellationError = '';

  cancellationLoading = false;

  constructor(
    private bookingService: BookingService
  ) {}

  get durationMinutes(): number {

    const start = new Date(this.booking.startDatetime);
    const end = new Date(this.booking.endDatetime);

    return Math.round(
      (end.getTime() - start.getTime()) / 60000
    );

  }

  closeModal(): void {
    this.close.emit();
  }

  onConfirmPayment(): void {
    this.confirmPayment.emit(this.booking);
  }

  openCancelForm(): void {

    this.showCancelForm = true;

    this.cancellationReason = '';

    this.employeePin = '';

    this.cancellationError = '';

  }

  closeCancelForm(): void {

    this.showCancelForm = false;

    this.cancellationError = '';

  }

  cancelBooking(): void {

    if (!this.cancellationReason.trim()) {

      this.cancellationError =
        'Ingresá el motivo de cancelación.';

      return;

    }

    if (!this.employeePin.trim()) {

      this.cancellationError =
        'Ingresá el PIN del empleado.';

      return;

    }

    this.cancellationLoading = true;

    this.cancellationError = '';

    const request = {

      bookingId: this.booking.id,

      cancellationReason:
        this.cancellationReason.trim(),

      employeePin:
        this.employeePin.trim()

    };

    this.bookingService.cancelBooking(request).subscribe({

      next: () => {

        this.cancellationLoading = false;

        this.bookingCancelled.emit();

        this.close.emit();

      },

      error: error => {

        console.error(
          'ERROR AL CANCELAR TURNO:',
          error
        );

        this.cancellationLoading = false;

        this.cancellationError =
          error?.error || 'No se pudo cancelar el turno.';

      }

    });

  }

}
