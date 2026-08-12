import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { BookingService } from '../../../../services/BookingService/booking-service';

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

  constructor(
    private bookingService: BookingService
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

      paymentMethod: new FormControl('', [
        Validators.required
      ]),

      depositAmount: new FormControl<number | null>(null, [
        Validators.min(0)
      ]),

      transactionId: new FormControl(''),

      employeePin: new FormControl('', [
        Validators.required
      ]),

      termsAccepted: new FormControl(false, [
        Validators.requiredTrue
      ])

    });

  }

  closeModal(): void {
    this.close.emit();
  }

  save(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

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

      next: response => {

        console.log('TURNO INTERNO CREADO:', response);

        this.loading = false;

        this.bookingCreated.emit();
        this.close.emit();

      },

      error: error => {

        console.error('ERROR AL CREAR TURNO INTERNO:', error);

        this.loading = false;

        this.errorMessage =
          error?.error || 'No se pudo crear el turno.';

      }

    });

  }

}
