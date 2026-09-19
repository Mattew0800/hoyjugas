import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BookingService } from '../../../../services/BookingService/booking-service';
import { BookingListModel } from '../../models/booking-list.model';
import { BookingResponseModel } from '../../models/booking-response.model';

import { ClientProfileModal } from '../client-profile-modal/client-profile-modal';

@Component({
  selector: 'app-booking-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ClientProfileModal
  ],
  templateUrl: './booking-detail-modal.html',
  styleUrl: './booking-detail-modal.scss'
})
export class BookingDetailModal implements OnChanges {

  @Input()
  booking?: BookingListModel;

  @Output()
  close = new EventEmitter<void>();

  @Output()
  canceled = new EventEmitter<void>();

  @Output()
  paymentConfirmed = new EventEmitter<BookingListModel>();

  bookingDetail?: BookingResponseModel;

  loading = false;

  errorMessage = '';

  showCancelForm = false;

  cancellationReason = '';

  employeePin = '';

  cancellationError = '';

  cancellationLoading = false;

  showClientProfile = false;

  selectedClient: any = null;

  clientProfileLoading = false;

  clientProfileError = '';

  selectedPaymentMethod = 'EFECTIVO';

  receivedAmount = 0;

  internalObservation = '';

  constructor(
    private bookingService: BookingService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['booking'] && this.booking) {
      this.resetModalState();
      this.loadBookingDetail();
    }
  }

  private resetModalState(): void {
    this.bookingDetail = undefined;
    this.loading = false;
    this.errorMessage = '';

    this.showCancelForm = false;
    this.cancellationReason = '';
    this.employeePin = '';
    this.cancellationError = '';
    this.cancellationLoading = false;

    this.showClientProfile = false;
    this.selectedClient = null;
    this.clientProfileLoading = false;
    this.clientProfileError = '';

    this.selectedPaymentMethod = 'EFECTIVO';
    this.receivedAmount = 0;
    this.internalObservation = '';
  }

  private loadBookingDetail(): void {
    if (!this.booking) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.bookingService
      .getBookingDetail({
        bookingId: this.booking.id
      })
      .subscribe({
        next: response => {
          this.bookingDetail = response;
          this.receivedAmount = this.remainingAmount;
          this.loading = false;
        },
        error: error => {
          this.loading = false;
          this.errorMessage =
            error?.error ||
            'No se pudo cargar el detalle del turno.';
        }
      });
  }

  get currentBooking(): BookingResponseModel | undefined {
    return this.bookingDetail;
  }

  get displayBooking(): BookingListModel | BookingResponseModel | undefined {
    return this.bookingDetail ?? this.booking;
  }

  get totalAmount(): number {
    return Number(this.bookingDetail?.totalAmount ?? 0);
  }

  get depositAmount(): number {
    return Number(this.bookingDetail?.depositAmount ?? 0);
  }

  get remainingAmount(): number {
    return Number(this.bookingDetail?.remainingAmount ?? 0);
  }

  get paymentStatus(): string {
    return this.bookingDetail?.paymentStatus ?? '';
  }

  get bookingStatus(): string {
    return this.bookingDetail?.status ?? '';
  }

  get durationMinutes(): number {
    const startDatetime = this.bookingDetail?.startDatetime;
    const endDatetime = this.bookingDetail?.endDatetime;

    if (!startDatetime || !endDatetime) {
      return 0;
    }

    const start = new Date(startDatetime).getTime();
    const end = new Date(endDatetime).getTime();

    if (Number.isNaN(start) || Number.isNaN(end)) {
      return 0;
    }

    return Math.max(
      0,
      Math.round((end - start) / 60000)
    );
  }

  get paymentStatusClass(): string {
    if (this.paymentStatus === 'PAGADO') {
      return 'paid';
    }

    if (
      this.depositAmount > 0 &&
      this.remainingAmount > 0
    ) {
      return 'partial';
    }

    return 'pending';
  }

  get paymentStatusTitle(): string {
    if (this.paymentStatus === 'PAGADO') {
      return 'Pago completo';
    }

    if (
      this.depositAmount > 0 &&
      this.remainingAmount > 0
    ) {
      return 'Seña abonada';
    }

    return 'Pago pendiente';
  }

  get paymentStatusDescription(): string {
    if (this.paymentStatus === 'PAGADO') {
      return 'El turno fue abonado en su totalidad.';
    }

    if (
      this.depositAmount > 0 &&
      this.remainingAmount > 0
    ) {
      return 'El turno tiene una seña abonada y un saldo pendiente.';
    }

    return 'El turno todavía no registra un pago completo.';
  }

  get paymentLabel(): string {
    if (this.paymentStatus === 'PAGADO') {
      return 'Pago completo';
    }

    if (
      this.depositAmount > 0 &&
      this.remainingAmount > 0
    ) {
      return 'Seña abonada';
    }

    return 'Pago pendiente';
  }

  get isPaid(): boolean {
    return this.paymentStatus === 'PAGADO';
  }

  get isPartiallyPaid(): boolean {
    return (
      this.depositAmount > 0 &&
      this.remainingAmount > 0
    );
  }

  get isUnpaid(): boolean {
    return (
      this.depositAmount <= 0 &&
      this.remainingAmount > 0
    );
  }

  get canConfirmPayment(): boolean {
    return (
      !!this.bookingDetail &&
      !this.loading &&
      !this.cancellationLoading &&
      this.remainingAmount > 0 &&
      this.paymentStatus !== 'PAGADO'
    );
  }

  get changeAmount(): number {
    const received = Number(this.receivedAmount);

    if (
      !Number.isFinite(received) ||
      received <= this.remainingAmount
    ) {
      return 0;
    }

    return received - this.remainingAmount;
  }

  confirmPayment(): void {
    if (!this.bookingDetail) {
      return;
    }

    if (!this.canConfirmPayment) {
      return;
    }

    if (this.receivedAmount < this.remainingAmount) {
      return;
    }

    if (!this.booking) {
      return;
    }

    this.paymentConfirmed.emit(this.booking);
  }

  onConfirmPayment(): void {
    this.confirmPayment();
  }

  openCancelForm(): void {
    if (
      this.loading ||
      this.cancellationLoading ||
      this.isPaid
    ) {
      return;
    }

    this.cancellationError = '';
    this.cancellationReason = '';
    this.employeePin = '';
    this.showCancelForm = true;
  }

  closeCancelForm(): void {
    if (this.cancellationLoading) {
      return;
    }

    this.showCancelForm = false;
    this.cancellationError = '';
    this.cancellationReason = '';
    this.employeePin = '';
  }

  cancelBooking(): void {
    if (!this.bookingDetail) {
      return;
    }

    this.cancellationError = '';

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

    this.bookingService
      .cancelBooking({
        bookingId: this.bookingDetail.id,
        cancellationReason:
          this.cancellationReason.trim(),
        employeePin: this.employeePin.trim()
      })
      .subscribe({
        next: () => {
          this.cancellationLoading = false;
          this.showCancelForm = false;
          this.canceled.emit();
          this.close.emit();
        },
        error: error => {
          this.cancellationLoading = false;

          this.cancellationError =
            error?.error ||
            'No se pudo cancelar el turno.';
        }
      });
  }

  openClientProfile(): void {
    if (!this.bookingDetail) {
      return;
    }

    this.clientProfileLoading = true;
    this.clientProfileError = '';

    this.selectedClient = {
      id: this.bookingDetail.clientId,
      name: this.bookingDetail.clientName,
      phone: this.bookingDetail.clientPhone
    };

    this.clientProfileLoading = false;
    this.showClientProfile = true;
  }

  closeClientProfile(): void {
    this.showClientProfile = false;
    this.selectedClient = null;
  }

  closeModal(): void {
    if (
      this.loading ||
      this.cancellationLoading
    ) {
      return;
    }

    this.close.emit();
  }
}
