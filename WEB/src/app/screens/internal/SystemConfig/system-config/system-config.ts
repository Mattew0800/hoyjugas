import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { InternalHeader } from '../../components/internal-header/internal-header';
import { InternalSideBar } from '../../components/internal-side-bar/internal-side-bar';

import { SystemConfigModel } from '../../models/system-config.model';
import { SystemConfigService } from '../../../../services/SystemConfigService/system-config-service';
import { ErrorHandlerService } from '../../../../services/ErrorHandlerService/error-handler.service';

@Component({
  selector: 'app-system-config-screen',
  standalone: true,
  imports: [
    FormsModule,
    InternalHeader,
    InternalSideBar
  ],
  templateUrl: './system-config.html',
  styleUrl: './system-config.scss'
})
export class SystemConfigScreen implements OnInit {

  config: SystemConfigModel = {
    cancellationHoursLimit: 0,
    reminderHoursBeforeBooking: 1,
    termsAndConditions: '',
    recurringMonthsAhead: 1,
    recurringInitialDepositTurns: 1,
    recurringDepositMultiplier: 1,
    maxRecurringCancellations: 1,
    address: '',
    sportsComplexName: ''
  };

  loading = false;
  saving = false;
  configLoaded = false;
  errorMessage = '';
  successMessage = '';

  cancellationHoursLimitError = '';
  reminderHoursBeforeBookingError = '';
  recurringMonthsAheadError = '';
  recurringInitialDepositTurnsError = '';
  recurringDepositMultiplierError = '';
  maxRecurringCancellationsError = '';
  termsAndConditionsError = '';

  constructor(
    private systemConfigService: SystemConfigService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadConfig();
  }

  loadConfig(): void {
    this.loading = true;
    this.configLoaded = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.clearValidationErrors();

    this.systemConfigService
      .getConfig()
      .subscribe({
        next: config => {
          this.config = config;
          this.configLoaded = true;
          this.loading = false;
        },

        error: error => {
          this.loading = false;
          this.configLoaded = false;
          this.errorMessage =
            this.errorHandler.getMessage(error);
        }
      });
  }

  saveConfig(): void {
    if (this.saving || !this.configLoaded) {
      return;
    }

    this.clearValidationErrors();
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.validateConfig()) {
      return;
    }

    this.saving = true;

    this.systemConfigService
      .updateConfig(this.config)
      .subscribe({
        next: config => {
          this.config = config;
          this.saving = false;
          this.successMessage =
            'La configuración se guardó correctamente.';
        },

        error: error => {
          this.saving = false;
          this.errorMessage =
            this.errorHandler.getMessage(error);
        }
      });
  }

  private validateConfig(): boolean {
    if (
      !this.validateCancellationHoursLimit() ||
      !this.validateReminderHoursBeforeBooking() ||
      !this.validateRecurringMonthsAhead() ||
      !this.validateRecurringInitialDepositTurns() ||
      !this.validateRecurringDepositMultiplier() ||
      !this.validateMaxRecurringCancellations() ||
      !this.validateTermsAndConditions()
    ) {
      return false;
    }

    return true;
  }

  private validateCancellationHoursLimit(): boolean {
    const value = this.config.cancellationHoursLimit;

    if (!Number.isFinite(value)) {
      this.cancellationHoursLimitError =
        'Ingresá una cantidad de horas válida.';
      return false;
    }

    if (value < 0) {
      this.cancellationHoursLimitError =
        'La cantidad de horas no puede ser menor a 0.';
      return false;
    }

    return true;
  }

  private validateReminderHoursBeforeBooking(): boolean {
    const value = this.config.reminderHoursBeforeBooking;

    if (!Number.isFinite(value)) {
      this.reminderHoursBeforeBookingError =
        'Ingresá una cantidad de horas válida.';
      return false;
    }

    if (value < 1 || value > 168) {
      this.reminderHoursBeforeBookingError =
        'Debe ser un valor entre 1 y 168 horas.';
      return false;
    }

    return true;
  }

  private validateRecurringMonthsAhead(): boolean {
    const value = this.config.recurringMonthsAhead;

    if (!Number.isFinite(value)) {
      this.recurringMonthsAheadError =
        'Ingresá una cantidad de meses válida.';
      return false;
    }

    if (value < 1 || value > 52) {
      this.recurringMonthsAheadError =
        'Debe ser un valor entre 1 y 52 meses.';
      return false;
    }

    return true;
  }

  private validateRecurringInitialDepositTurns(): boolean {
    const value = this.config.recurringInitialDepositTurns;

    if (!Number.isFinite(value)) {
      this.recurringInitialDepositTurnsError =
        'Ingresá una cantidad de turnos válida.';
      return false;
    }

    if (value < 1) {
      this.recurringInitialDepositTurnsError =
        'Debe ser al menos 1 turno.';
      return false;
    }

    return true;
  }

  private validateRecurringDepositMultiplier(): boolean {
    const value = this.config.recurringDepositMultiplier;

    if (!Number.isFinite(value)) {
      this.recurringDepositMultiplierError =
        'Ingresá un multiplicador válido.';
      return false;
    }

    if (value < 1) {
      this.recurringDepositMultiplierError =
        'El multiplicador debe ser igual o mayor a 1.';
      return false;
    }

    return true;
  }

  private validateMaxRecurringCancellations(): boolean {
    const value = this.config.maxRecurringCancellations;

    if (!Number.isFinite(value)) {
      this.maxRecurringCancellationsError =
        'Ingresá una cantidad de cancelaciones válida.';
      return false;
    }

    if (value < 1) {
      this.maxRecurringCancellationsError =
        'Debe ser al menos 1 cancelación.';
      return false;
    }

    return true;
  }

  private validateTermsAndConditions(): boolean {
    const value = this.config.termsAndConditions.trim();

    if (!value) {
      this.termsAndConditionsError =
        'Los términos y condiciones son obligatorios.';
      return false;
    }

    return true;
  }

  private clearValidationErrors(): void {
    this.cancellationHoursLimitError = '';
    this.reminderHoursBeforeBookingError = '';
    this.recurringMonthsAheadError = '';
    this.recurringInitialDepositTurnsError = '';
    this.recurringDepositMultiplierError = '';
    this.maxRecurringCancellationsError = '';
    this.termsAndConditionsError = '';
  }
}
