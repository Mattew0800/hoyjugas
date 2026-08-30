import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { BookingService } from '../../../../services/BookingService/booking-service';
import { RecurringBookingService } from '../../../../services/RecurringBookingService/recurring-booking-service';

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

  @Input() selectedDate!: Date;

  @Output() close = new EventEmitter<void>();
  @Output() bookingCreated = new EventEmitter<void>();

  form: FormGroup;

  errorMessage = '';
  loading = false;

  bookingType: 'single' | 'recurring' = 'single';

  previewLoading = false;
  previewVisible = false;
  previewConfirmed = false;

  preview: any = null;

  constructor(
    private bookingService: BookingService,
    private recurringBookingService: RecurringBookingService
  ) {

    this.form = new FormGroup({

      clientId: new FormControl<number | null>(null, [
        Validators.required
      ]),

      spaceId: new FormControl<number | null>(null, [
        Validators.required
      ]),

      startDatetime: new FormControl('', [
        Validators.required
      ]),

      startDate: new FormControl('', [
        Validators.required
      ]),

      startTime: new FormControl('', [
        Validators.required
      ]),

      intervalWeeks: new FormControl(1, [
        Validators.required
      ]),

      endDate: new FormControl('', [
        Validators.required
      ]),

      paymentMethod: new FormControl('', [
        Validators.required
      ]),

      depositAmount: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(0.01)
      ]),

      transactionId: new FormControl(''),

      employeePin: new FormControl('', [
        Validators.required
      ]),

      termsAccepted: new FormControl(false, [
        Validators.requiredTrue
      ])

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
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;

    this.form.get('startDate')?.setValue(formattedDate);

  }

  closeModal(): void {

    if (this.loading || this.previewLoading) {
      return;
    }

    this.close.emit();

  }

  setBookingType(type: 'single' | 'recurring'): void {

    this.bookingType = type;

    this.errorMessage = '';
    this.previewVisible = false;
    this.previewConfirmed = false;
    this.preview = null;

    const startDatetime = this.form.get('startDatetime');
    const startDate = this.form.get('startDate');
    const startTime = this.form.get('startTime');
    const intervalWeeks = this.form.get('intervalWeeks');
    const endDate = this.form.get('endDate');

    if (type === 'single') {

      startDatetime?.setValidators([
        Validators.required
      ]);

      startDate?.clearValidators();
      startTime?.clearValidators();
      intervalWeeks?.clearValidators();
      endDate?.clearValidators();

    } else {

      startDatetime?.clearValidators();

      startDate?.setValidators([
        Validators.required
      ]);

      startTime?.setValidators([
        Validators.required
      ]);

      intervalWeeks?.setValidators([
        Validators.required
      ]);

      endDate?.setValidators([
        Validators.required
      ]);

    }

    startDatetime?.updateValueAndValidity();
    startDate?.updateValueAndValidity();
    startTime?.updateValueAndValidity();
    intervalWeeks?.updateValueAndValidity();
    endDate?.updateValueAndValidity();

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

      this.errorMessage =
        'Completá correctamente todos los campos obligatorios.';

      return;
    }

    this.errorMessage = '';
    this.loading = true;

    const formValue = this.form.value;

    const request = {
      clientId: formValue.clientId,
      spaceId: formValue.spaceId,
      startDatetime: formValue.startDatetime,
      paymentMethod: formValue.paymentMethod,
      depositAmount: formValue.depositAmount,
      transactionId: formValue.transactionId || null,
      employeePin: formValue.employeePin,
      termsAccepted: formValue.termsAccepted
    };

    this.bookingService.createBookingByEmployee(request).subscribe({

      next: () => {

        this.loading = false;

        this.bookingCreated.emit();
        this.close.emit();

      },

      error: error => {

        this.loading = false;

        this.errorMessage =
          typeof error?.error === 'string'
            ? error.error
            : error?.error?.message || 'No se pudo crear el turno.';

      }

    });

  }

  private previewRecurringBooking(): void {

    if (!this.validateRecurringPreviewForm()) {
      return;
    }

    this.errorMessage = '';
    this.previewLoading = true;

    const formValue = this.form.value;

    const request = {
      clientId: formValue.clientId,
      spaceId: formValue.spaceId,
      startDate: formValue.startDate,
      startTime: formValue.startTime,
      intervalWeeks: Number(formValue.intervalWeeks),
      endDate: formValue.endDate,
      termsAccepted: formValue.termsAccepted,
      depositAmount: formValue.depositAmount,
      paymentMethod: formValue.paymentMethod,
      transactionId: formValue.transactionId || null,
      employeePin: formValue.employeePin
    };

    this.recurringBookingService.previewRecurringBooking(request).subscribe({

      next: response => {

        this.preview = response;
        this.previewVisible = true;
        this.previewConfirmed = false;
        this.previewLoading = false;
        this.errorMessage = '';

      },

      error: error => {

        this.previewLoading = false;

        this.errorMessage =
          typeof error?.error === 'string'
            ? error.error
            : error?.error?.message ||
            'No se pudo generar la vista previa del turno fijo.';

      }

    });

  }

  confirmRecurringBooking(): void {

    if (!this.preview) {
      return;
    }

    const conflicts = this.getPreviewConflictCount();

    if (conflicts > 0) {

      this.errorMessage =
        'Hay turnos que se superponen con otras reservas. Corregí los conflictos antes de confirmar.';

      return;
    }

    this.previewConfirmed = true;
    this.errorMessage = '';

    this.createRecurringBooking();

  }

  private createRecurringBooking(): void {

    if (!this.validateRecurringCreateForm()) {
      return;
    }

    if (!this.preview) {

      this.errorMessage =
        'Primero debés consultar la disponibilidad.';

      return;
    }

    this.errorMessage = '';
    this.loading = true;

    const formValue = this.form.value;

    const request = {
      clientId: formValue.clientId,
      spaceId: formValue.spaceId,
      startDate: formValue.startDate,
      startTime: formValue.startTime,
      intervalWeeks: Number(formValue.intervalWeeks),
      endDate: formValue.endDate,
      termsAccepted: formValue.termsAccepted,
      depositAmount: formValue.depositAmount,
      paymentMethod: formValue.paymentMethod,
      transactionId: formValue.transactionId || null,
      employeePin: formValue.employeePin
    };

    this.recurringBookingService.createRecurringBooking(request).subscribe({

      next: () => {

        this.loading = false;

        this.bookingCreated.emit();
        this.close.emit();

      },

      error: error => {

        this.loading = false;
        this.previewConfirmed = false;

        this.errorMessage =
          typeof error?.error === 'string'
            ? error.error
            : error?.error?.message ||
            'No se pudo crear el turno fijo.';

      }

    });

  }

  private validateRecurringPreviewForm(): boolean {

    const requiredFields = [
      'clientId',
      'spaceId',
      'startDate',
      'startTime',
      'intervalWeeks',
      'endDate',
      'termsAccepted',
      'depositAmount',
      'paymentMethod'
    ];

    let valid = true;

    for (const field of requiredFields) {

      const control = this.form.get(field);

      if (control?.invalid) {

        control.markAsTouched();

        valid = false;

      }

    }

    if (!valid) {

      this.errorMessage =
        'Completá todos los datos necesarios para consultar la disponibilidad.';

      return false;
    }

    return this.validateRecurringDates();

  }

  private validateRecurringCreateForm(): boolean {

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

    for (const field of requiredFields) {

      const control = this.form.get(field);

      if (control?.invalid) {

        control.markAsTouched();

        valid = false;

      }

    }

    if (!valid) {

      this.errorMessage =
        'Completá todos los datos obligatorios para crear el turno fijo.';

      return false;
    }

    return this.validateRecurringDates();

  }

  private validateRecurringDates(): boolean {

    const startDate = this.form.get('startDate')?.value;
    const endDate = this.form.get('endDate')?.value;

    if (!startDate || !endDate) {
      return false;
    }

    if (endDate <= startDate) {

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

    return this.preview?.conflictingSlots ?? 0;

  }

  getPreviewAvailableCount(): number {

    return this.preview?.available?.length ?? 0;

  }

  getPreviewConflictDates(): string[] {

    return this.preview?.conflicts ?? [];

  }

}
