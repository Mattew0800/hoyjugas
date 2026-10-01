import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { InternalHeader } from '../../components/internal-header/internal-header';
import { InternalSideBar } from '../../components/internal-side-bar/internal-side-bar';

import { SystemConfigModel } from '../../models/system-config.model';
import { ComplexScheduleResponseModel } from '../../models/complex-schedule-response.model';

import { SystemConfigService } from '../../../../services/SystemConfigService/system-config-service';
import { ComplexScheduleService } from '../../../../services/ComplexScheduleService/complex-schedule-service';
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

  complexSchedules: ComplexScheduleResponseModel[] = [];

  loading = false;
  schedulesLoading = false;
  saving = false;
  savingSchedule = false;
  configLoaded = false;

  errorMessage = '';
  schedulesErrorMessage = '';
  successMessage = '';

  cancellationHoursLimitError = '';
  reminderHoursBeforeBookingError = '';
  recurringMonthsAheadError = '';
  recurringInitialDepositTurnsError = '';
  recurringDepositMultiplierError = '';
  maxRecurringCancellationsError = '';
  termsAndConditionsError = '';

  showScheduleModal = false;

  editingScheduleId: number | null = null;

  scheduleDayType = '';
  scheduleOpeningTime = '';
  scheduleClosingTime = '';

  scheduleDayTypeError = '';
  scheduleOpeningTimeError = '';
  scheduleClosingTimeError = '';

  confirmingScheduleId: number | null = null;
  processingScheduleDelete = false;

  readonly dayTypes = [
    { value: 'LUNES', label: 'Lunes' },
    { value: 'MARTES', label: 'Martes' },
    { value: 'MIERCOLES', label: 'Miércoles' },
    { value: 'JUEVES', label: 'Jueves' },
    { value: 'VIERNES', label: 'Viernes' },
    { value: 'SABADO', label: 'Sábado' },
    { value: 'DOMINGO', label: 'Domingo' },
    { value: 'FIN_DE_SEMANA', label: 'Fin de semana' },
    { value: 'DIA_DE_SEMANA', label: 'Día de semana' },
    { value: 'FERIADO', label: 'Feriado' },
    { value: 'HOY', label: 'Hoy' }
  ];

  constructor(
    private systemConfigService: SystemConfigService,
    private complexScheduleService: ComplexScheduleService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadConfig();
    this.loadComplexSchedules();
  }

  loadConfig(): void {
    this.loading = true;
    this.errorMessage = '';

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
          this.errorMessage =
            this.errorHandler.getMessage(error);
        }
      });
  }

  loadComplexSchedules(): void {
    this.schedulesLoading = true;
    this.schedulesErrorMessage = '';

    this.complexScheduleService
      .getAll()
      .subscribe({
        next: schedules => {
          this.complexSchedules = schedules;
          this.schedulesLoading = false;
        },
        error: error => {
          this.schedulesLoading = false;
          this.schedulesErrorMessage =
            this.errorHandler.getMessage(error);
        }
      });
  }

  saveConfig(): void {
    if (this.saving || !this.validateConfig()) {
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.systemConfigService
      .updateConfig(this.config)
      .subscribe({
        next: config => {
          this.config = config;
          this.saving = false;
          this.successMessage =
            'Configuración guardada correctamente.';
        },
        error: error => {
          this.saving = false;
          this.errorMessage =
            this.errorHandler.getMessage(error);
        }
      });
  }

  validateConfig(): boolean {
    this.clearConfigErrors();

    let valid = true;

    if (
      this.config.cancellationHoursLimit == null ||
      this.config.cancellationHoursLimit < 0
    ) {
      this.cancellationHoursLimitError =
        'El valor debe ser mayor o igual a 0.';
      valid = false;
    }

    if (
      this.config.reminderHoursBeforeBooking == null ||
      this.config.reminderHoursBeforeBooking < 1 ||
      this.config.reminderHoursBeforeBooking > 168
    ) {
      this.reminderHoursBeforeBookingError =
        'El valor debe estar entre 1 y 168.';
      valid = false;
    }

    if (
      this.config.recurringMonthsAhead == null ||
      this.config.recurringMonthsAhead < 1 ||
      this.config.recurringMonthsAhead > 52
    ) {
      this.recurringMonthsAheadError =
        'El valor debe estar entre 1 y 52.';
      valid = false;
    }

    if (
      this.config.recurringInitialDepositTurns == null ||
      this.config.recurringInitialDepositTurns < 1
    ) {
      this.recurringInitialDepositTurnsError =
        'El valor debe ser mayor a 0.';
      valid = false;
    }

    if (
      this.config.recurringDepositMultiplier == null ||
      this.config.recurringDepositMultiplier < 1
    ) {
      this.recurringDepositMultiplierError =
        'El valor debe ser mayor o igual a 1.';
      valid = false;
    }

    if (
      this.config.maxRecurringCancellations == null ||
      this.config.maxRecurringCancellations < 1
    ) {
      this.maxRecurringCancellationsError =
        'El valor debe ser mayor a 0.';
      valid = false;
    }

    if (!this.config.termsAndConditions?.trim()) {
      this.termsAndConditionsError =
        'Los términos y condiciones son obligatorios.';
      valid = false;
    }

    return valid;
  }

  clearConfigErrors(): void {
    this.cancellationHoursLimitError = '';
    this.reminderHoursBeforeBookingError = '';
    this.recurringMonthsAheadError = '';
    this.recurringInitialDepositTurnsError = '';
    this.recurringDepositMultiplierError = '';
    this.maxRecurringCancellationsError = '';
    this.termsAndConditionsError = '';
  }

  getDayName(dayType: string): string {
    const days: Record<string, string> = {
      LUNES: 'Lunes',
      MARTES: 'Martes',
      MIERCOLES: 'Miércoles',
      JUEVES: 'Jueves',
      VIERNES: 'Viernes',
      SABADO: 'Sábado',
      DOMINGO: 'Domingo',
      FIN_DE_SEMANA: 'Fin de semana',
      DIA_DE_SEMANA: 'Día de semana',
      FERIADO: 'Feriado',
      HOY: 'Hoy'
    };

    return days[dayType] ?? dayType;
  }

  openScheduleModal(): void {
    this.showScheduleModal = true;
    this.savingSchedule = false;
    this.editingScheduleId = null;

    this.scheduleDayType = '';
    this.scheduleOpeningTime = '';
    this.scheduleClosingTime = '';

    this.clearScheduleErrors();
  }

  editComplexSchedule(
    schedule: ComplexScheduleResponseModel
  ): void {
    this.showScheduleModal = true;
    this.savingSchedule = false;
    this.editingScheduleId = schedule.id;

    this.scheduleDayType = schedule.dayType;
    this.scheduleOpeningTime = schedule.openingTime;
    this.scheduleClosingTime = schedule.closingTime;

    this.clearScheduleErrors();
  }

  closeScheduleModal(): void {
    if (this.savingSchedule) {
      return;
    }

    this.showScheduleModal = false;
    this.editingScheduleId = null;

    this.clearScheduleErrors();
  }

  clearScheduleErrors(): void {
    this.scheduleDayTypeError = '';
    this.scheduleOpeningTimeError = '';
    this.scheduleClosingTimeError = '';
  }

  validateSchedule(): boolean {
    this.clearScheduleErrors();

    let valid = true;

    if (!this.scheduleDayType) {
      this.scheduleDayTypeError =
        'Seleccioná un día.';
      valid = false;
    }

    if (!this.scheduleOpeningTime) {
      this.scheduleOpeningTimeError =
        'Ingresá la hora de apertura.';
      valid = false;
    }

    if (!this.scheduleClosingTime) {
      this.scheduleClosingTimeError =
        'Ingresá la hora de cierre.';
      valid = false;
    }

    if (
      this.scheduleOpeningTime &&
      this.scheduleClosingTime &&
      this.scheduleClosingTime !== '00:00' &&
      this.scheduleOpeningTime >= this.scheduleClosingTime
    ) {
      this.scheduleClosingTimeError =
        'La hora de cierre debe ser posterior a la hora de apertura.';
      valid = false;
    }

    return valid;
  }

  saveComplexSchedule(): void {
    if (
      this.savingSchedule ||
      !this.validateSchedule()
    ) {
      return;
    }

    this.savingSchedule = true;
    this.schedulesErrorMessage = '';

    if (this.editingScheduleId !== null) {
      this.complexScheduleService
        .update({
          id: this.editingScheduleId,
          dayType: this.scheduleDayType,
          openingTime: this.scheduleOpeningTime,
          closingTime: this.scheduleClosingTime
        })
        .subscribe({
          next: updatedSchedule => {
            this.complexSchedules =
              this.complexSchedules.map(
                schedule =>
                  schedule.id === updatedSchedule.id
                    ? updatedSchedule
                    : schedule
              );

            this.savingSchedule = false;
            this.showScheduleModal = false;
            this.editingScheduleId = null;

            this.clearScheduleErrors();
          },
          error: error => {
            this.savingSchedule = false;
            this.schedulesErrorMessage =
              this.errorHandler.getMessage(error);
          }
        });

      return;
    }

    this.complexScheduleService
      .save({
        dayType: this.scheduleDayType,
        openingTime: this.scheduleOpeningTime,
        closingTime: this.scheduleClosingTime
      })
      .subscribe({
        next: schedule => {
          this.complexSchedules = [
            ...this.complexSchedules,
            schedule
          ];

          this.savingSchedule = false;
          this.showScheduleModal = false;

          this.clearScheduleErrors();
        },
        error: error => {
          this.savingSchedule = false;
          this.schedulesErrorMessage =
            this.errorHandler.getMessage(error);
        }
      });
  }

  confirmDeleteSchedule(scheduleId: number): void {
    this.confirmingScheduleId = scheduleId;
    this.processingScheduleDelete = false;
  }

  cancelDeleteSchedule(): void {
    if (this.processingScheduleDelete) {
      return;
    }

    this.confirmingScheduleId = null;
  }

  deleteComplexSchedule(): void {
    if (
      this.confirmingScheduleId === null ||
      this.processingScheduleDelete
    ) {
      return;
    }

    this.processingScheduleDelete = true;
    this.schedulesErrorMessage = '';

    const scheduleId = this.confirmingScheduleId;

    this.complexScheduleService
      .delete(scheduleId)
      .subscribe({
        next: () => {
          this.complexSchedules =
            this.complexSchedules.filter(
              schedule => schedule.id !== scheduleId
            );

          this.processingScheduleDelete = false;
          this.confirmingScheduleId = null;
        },
        error: error => {
          this.processingScheduleDelete = false;
          this.schedulesErrorMessage =
            this.errorHandler.getMessage(error);
        }
      });
  }
}
