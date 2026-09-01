import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { BookingService } from '../../../../services/BookingService/booking-service';
import { RecurringBookingService } from '../../../../services/RecurringBookingService/recurring-booking-service';

import { InternalBookingRequestModel } from '../../models/internal-booking-request.model';
import {RecurringBookingPreviewModel} from '../../models/recurring-booking-preview.model';
import {RecurringBookingRequestModel} from '../../models/recurring-booking-request.model';

@Component({
  selector: 'app-internal-booking-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './internal-booking-modal.html',
  styleUrl: './internal-booking-modal.scss'
})
export class InternalBookingModal {

  @Input()
  selectedDate!: Date;

  @Output()
  close = new EventEmitter<void>();

  @Output()
  bookingCreated = new EventEmitter<void>();

  form: FormGroup;

  errorMessage = '';

  loading = false;

  bookingType: 'single' | 'recurring' = 'single';

  previewLoading = false;

  previewVisible = false;

  previewConfirmed = false;

  preview: RecurringBookingPreviewModel | null = null;


  constructor(
    private bookingService: BookingService,
    private recurringBookingService: RecurringBookingService
  ) {

    this.form = new FormGroup({

      clientId: new FormControl<number | null>(
        null,
        [
          Validators.required
        ]
      ),

      spaceId: new FormControl<number | null>(
        null,
        [
          Validators.required
        ]
      ),

      startDatetime: new FormControl(
        '',
        [
          Validators.required
        ]
      ),

      startDate: new FormControl(
        '',
        [
          Validators.required
        ]
      ),

      startTime: new FormControl(
        '',
        [
          Validators.required
        ]
      ),

      intervalWeeks: new FormControl(
        1,
        [
          Validators.required
        ]
      ),

      endDate: new FormControl(
        '',
        [
          Validators.required
        ]
      ),

      paymentMethod: new FormControl(
        '',
        [
          Validators.required
        ]
      ),

      depositAmount: new FormControl<number | null>(
        null,
        [
          Validators.required,
          Validators.min(0.01)
        ]
      ),

      transactionId: new FormControl(
        ''
      ),

      employeePin: new FormControl(
        '',
        [
          Validators.required
        ]
      ),

      termsAccepted: new FormControl(
        false,
        [
          Validators.requiredTrue
        ]
      )

    });

    this.setBookingType('single');

  }

  ngOnInit(): void {

    this.initializeStartDate();

  }

  private initializeStartDate(): void {

    if (!this.selectedDate) {
      return;
    }

    const date = new Date(this.selectedDate);

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      date.getDate()
    ).padStart(2, '0');

    const formattedDate =
      `${year}-${month}-${day}`;

    this.form
      .get('startDate')
      ?.setValue(formattedDate);

  }

  closeModal(): void {

    if (
      this.loading ||
      this.previewLoading
    ) {
      return;
    }

    this.close.emit();

  }

  setBookingType(
    type: 'single' | 'recurring'
  ): void {

    this.bookingType = type;

    this.errorMessage = '';

    this.previewVisible = false;

    this.previewConfirmed = false;

    this.preview = null;

    if (type === 'single') {

      this.form
        .get('startDatetime')
        ?.setValidators([
          Validators.required
        ]);

      this.form
        .get('startDate')
        ?.clearValidators();

      this.form
        .get('startTime')
        ?.clearValidators();

      this.form
        .get('intervalWeeks')
        ?.clearValidators();

      this.form
        .get('endDate')
        ?.clearValidators();

    } else {

      this.form
        .get('startDatetime')
        ?.clearValidators();

      this.form
        .get('startDate')
        ?.setValidators([
          Validators.required
        ]);

      this.form
        .get('startTime')
        ?.setValidators([
          Validators.required
        ]);

      this.form
        .get('intervalWeeks')
        ?.setValidators([
          Validators.required
        ]);

      this.form
        .get('endDate')
        ?.setValidators([
          Validators.required
        ]);

    }

    this.form
      .get('startDatetime')
      ?.updateValueAndValidity();

    this.form
      .get('startDate')
      ?.updateValueAndValidity();

    this.form
      .get('startTime')
      ?.updateValueAndValidity();

    this.form
      .get('intervalWeeks')
      ?.updateValueAndValidity();

    this.form
      .get('endDate')
      ?.updateValueAndValidity();

  }

  save(): void {

    if (this.bookingType === 'single') {

      this.saveSingleBooking();

      return;

    }

    if (!this.previewVisible) {

      this.previewRecurringBooking();

      return;

    }

    if (!this.previewConfirmed) {

      this.confirmRecurringBooking();

      return;

    }

    this.createRecurringBooking();

  }

  private saveSingleBooking(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;

    }

    this.errorMessage = '';

    this.loading = true;

    const formValue = this.form.value;

    const request: InternalBookingRequestModel = {

      clientId: formValue.clientId,

      spaceId: formValue.spaceId,

      startDatetime: formValue.startDatetime,

      paymentMethod: formValue.paymentMethod,

      depositAmount: formValue.depositAmount,

      transactionId:
        formValue.transactionId || null,

      employeePin: formValue.employeePin,

      termsAccepted: formValue.termsAccepted

    };

    this.bookingService
      .createInternalBooking(request)
      .subscribe({

        next: () => {

          this.loading = false;

          this.bookingCreated.emit();

          this.close.emit();

        },

        error: error => {

          this.loading = false;

          this.errorMessage =
            error?.error ||
            'No se pudo crear el turno.';

        }

      });

  }

  private buildRecurringBookingRequest(
    depositAmount?: number
  ): RecurringBookingRequestModel {

    const formValue = this.form.value;

    return {

      clientId: formValue.clientId,

      spaceId: formValue.spaceId,

      startDate: formValue.startDate,

      startTime: formValue.startTime,

      intervalWeeks: Number(formValue.intervalWeeks),

      endDate: formValue.endDate,

      termsAccepted: formValue.termsAccepted,

      depositAmount:
        depositAmount ?? formValue.depositAmount,

      paymentMethod: formValue.paymentMethod,

      transactionId:
        formValue.transactionId || null,

      employeePin: formValue.employeePin

    };

  }

  private previewRecurringBooking(): void {

    if (!this.validateRecurringForm()) {
      return;
    }

    this.errorMessage = '';

    this.previewLoading = true;

    const request =
      this.buildRecurringBookingRequest();

    this.recurringBookingService
      .previewRecurringBooking(request)
      .subscribe({

        next: response => {

          this.previewLoading = false;

          this.preview = response;

          this.previewVisible = true;

          this.previewConfirmed = false;

        },

        error: error => {

          this.previewLoading = false;

          this.errorMessage =
            error?.error ||
            'No se pudo obtener la disponibilidad del turno fijo.';

        }

      });

  }

  confirmRecurringBooking(): void {

    if (!this.preview) {
      return;
    }

    if (
      this.getPreviewConflictCount() > 0
    ) {

      this.errorMessage =
        'Hay turnos que se superponen con otras reservas. Corregí los conflictos antes de confirmar.';

      return;

    }

    this.previewConfirmed = true;

    this.errorMessage = '';

    this.createRecurringBooking();

  }

  private createRecurringBooking(): void {

    if (!this.validateRecurringForm()) {
      return;
    }

    if (!this.preview) {
      return;
    }

    const requiredDeposit =
      this.preview.firstDepositAmount;

    if (requiredDeposit === null || requiredDeposit === undefined) {

      this.errorMessage =
        'No se pudo determinar el monto de la seña necesaria.';

      return;

    }

    this.errorMessage = '';

    this.loading = true;

    const request =
      this.buildRecurringBookingRequest(requiredDeposit);

    this.recurringBookingService
      .createRecurringBooking(request)
      .subscribe({

        next: () => {

          this.loading = false;

          this.bookingCreated.emit();

          this.close.emit();

        },

        error: error => {

          this.loading = false;

          this.previewConfirmed = false;

          this.errorMessage =
            error?.error ||
            'No se pudo crear el turno fijo.';

        }

      });

  }

  private validateRecurringForm(): boolean {

    const requiredFields = [

      'clientId',

      'spaceId',

      'startDate',

      'startTime',

      'intervalWeeks',

      'endDate',

      'paymentMethod',

      'depositAmount',

      'employeePin',

      'termsAccepted'

    ];

    let valid = true;

    for (
      const field of requiredFields
      ) {

      const control =
        this.form.get(field);

      if (control?.invalid) {

        control.markAsTouched();

        valid = false;

      }

    }

    if (!valid) {
      return false;
    }

    const startDate =
      this.form
        .get('startDate')
        ?.value;

    const endDate =
      this.form
        .get('endDate')
        ?.value;

    if (
      startDate &&
      endDate &&
      endDate <= startDate
    ) {

      this.errorMessage =
        'La fecha de finalización debe ser posterior a la fecha de inicio.';

      return false;

    }

    return true;

  }

  backToRecurringForm(): void {

    this.previewVisible = false;

    this.previewConfirmed = false;

    this.preview = null;

    this.errorMessage = '';

  }

  getPreviewConflictCount(): number {

    return (
      this.preview?.conflictingSlots ?? 0
    );

  }

  getPreviewAvailableCount(): number {

    return (
      this.preview?.available?.length ?? 0
    );

  }

  getPreviewConflictDates(): string[] {

    return (
      this.preview?.conflicts ?? []
    );

  }

}
