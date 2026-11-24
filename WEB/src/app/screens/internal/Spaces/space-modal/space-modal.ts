
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import {Observable, from, tap} from 'rxjs';
import { concatMap, toArray } from 'rxjs/operators';

import { SpaceService } from '../../../../services/SpaceService/SpaceService';
import { ErrorHandlerService } from '../../../../services/ErrorHandlerService/error-handler.service';

interface DaySchedule {
  id?: number;
  spaceId?: number;
  label: string;
  dayType: string;
  openingTime: string;
  closingTime: string;
  enabled: boolean;
}

interface PricingConfig {
  id?: number;
  label: string;
  dayType: string;
  openingTime: string;
  closingTime: string;
  price: number;
  enabled: boolean;
}

@Component({
  selector: 'app-space-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './space-modal.html',
  styleUrl: './space-modal.scss'
})
export class SpaceModal implements OnInit {

  @Input()
  spaceId: number | null = null;

  @Output()
  close = new EventEmitter<boolean>();

  saving = false;
  schedulesLoaded = false;
  errorMessage = '';

  private readonly validDayTypes = [
    'LUNES',
    'MARTES',
    'MIERCOLES',
    'JUEVES',
    'VIERNES',
    'SABADO',
    'DOMINGO',
    'DIA_DE_SEMANA',
    'FIN_DE_SEMANA'
  ];

  private readonly weekdays = [
    'LUNES',
    'MARTES',
    'MIERCOLES',
    'JUEVES',
    'VIERNES'
  ];

  private readonly weekend = [
    'SABADO',
    'DOMINGO'
  ];

  space = {
    name: '',
    type: 'CANCHA',
    slotDuration: 60,
    isActive: true,
    fixedDeposit: 10000,
    photoUrl: ''
  };

  schedules: DaySchedule[] = [];
  days: PricingConfig[] = [];

  private originalSchedules: DaySchedule[] = [];

  constructor(
    private spaceService: SpaceService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    if (this.spaceId !== null) {
      this.loadSpace();
    } else {
      this.schedulesLoaded = true;
      this.addSchedule();
      this.addConfiguration();
    }
  }

  private loadSpace(): void {
    this.errorMessage = '';
    this.schedulesLoaded = false;

    this.spaceService.getSpaceDetail(this.spaceId!).subscribe({
      next: space => {
        this.space = {
          name: space.name ?? '',
          type: space.type ?? 'CANCHA',
          slotDuration: Number(space.slotDuration ?? 60),
          isActive: space.isActive ?? true,
          fixedDeposit: Number(space.fixedDeposit ?? 0),
          photoUrl: space.photoUrl ?? ''
        };

        this.days = (space.pricings ?? []).map((pricing: any) => ({
          id: pricing.id,
          label: this.getDayLabel(pricing.dayType),
          dayType: pricing.dayType,
          openingTime: this.formatTime(pricing.startTime),
          closingTime: this.formatTime(pricing.endTime),
          price: Number(pricing.price ?? 0),
          enabled: true
        }));

        this.spaceService.getSchedulesBySpace(this.spaceId!).subscribe({
          next: schedules => {
            this.schedules = schedules.map((schedule: any) => ({
              id: schedule.id,
              spaceId: schedule.spaceId,
              label: this.getDayLabel(schedule.dayType),
              dayType: schedule.dayType,
              openingTime: this.formatTime(schedule.openingTime),
              closingTime: this.formatTime(schedule.closingTime),
              enabled: true
            }));

            this.originalSchedules = this.schedules.map(schedule => ({
              ...schedule
            }));

            if (this.schedules.length === 0) {
              this.addSchedule();
            }

            if (this.days.length === 0) {
              this.addConfiguration();
            }

            this.schedulesLoaded = true;
          },
          error: error => {
            this.schedulesLoaded = false;
            this.errorMessage = this.getSpaceErrorMessage(error);
          }
        });
      },
      error: error => {
        this.schedulesLoaded = false;
        this.errorMessage = this.getSpaceErrorMessage(error);
      }
    });
  }

  addSchedule(): void {
    this.schedules.push({
      label: 'Lunes a viernes',
      dayType: 'DIA_DE_SEMANA',
      openingTime: '',
      closingTime: '',
      enabled: true
    });

    this.errorMessage = '';
  }

  removeSchedule(index: number): void {
    if (this.saving || index < 0 || index >= this.schedules.length) {
      return;
    }

    this.schedules.splice(index, 1);
    this.errorMessage = '';
  }

  addConfiguration(): void {
    this.days.push({
      label: 'Lunes a viernes',
      dayType: 'DIA_DE_SEMANA',
      openingTime: '',
      closingTime: '',
      price: 0,
      enabled: true
    });

    this.errorMessage = '';
  }

  removeConfiguration(index: number): void {
    if (this.saving || index < 0 || index >= this.days.length) {
      return;
    }

    this.days.splice(index, 1);
    this.errorMessage = '';
  }

  onScheduleDayTypeChange(schedule: DaySchedule): void {
    schedule.label = this.getDayLabel(schedule.dayType);
    this.errorMessage = '';
  }

  onDayTypeChange(day: PricingConfig): void {
    day.label = this.getDayLabel(day.dayType);
    this.errorMessage = '';
  }

  closeModal(): void {
    if (!this.saving) {
      this.close.emit(false);
    }
  }

  save(): void {
    if (!this.schedulesLoaded) {
      this.errorMessage =
        'Esperá a que se carguen los horarios antes de guardar el espacio.';
      return;
    }

    this.errorMessage = '';

    const schedules = this.getEnabledSchedules();
    const configurations = this.getEnabledPricings();

    if (schedules.length === 0 || configurations.length === 0) {
      const message =
        'No es posible guardar un espacio sin configuraciones de horarios y precios. El espacio debe permanecer inactivo.';

      if (this.spaceId === null) {
        this.errorMessage = message;
        return;
      }

      this.saving = true;

      this.spaceService.toggleSpaceStatus(
        this.spaceId,
        false
      ).subscribe({
        next: () => {
          this.saving = false;
          this.space.isActive = false;
          this.errorMessage = message;
        },
        error: error => {
          this.saving = false;
          this.errorMessage = this.getSpaceErrorMessage(error);
        }
      });

      return;
    }

    if (!this.validateForm()) {
      return;
    }

    if (this.spaceId === null) {
      this.createSpace();
      return;
    }

    this.updateExistingSpace();
  }

  private getEnabledSchedules(): DaySchedule[] {
    return this.schedules.filter(schedule =>
      schedule.enabled &&
      (schedule.openingTime.trim() !== '' ||
        schedule.closingTime.trim() !== '')
    );
  }

  private getEnabledPricings(): PricingConfig[] {
    return this.days.filter(day =>
      day.enabled &&
      (day.openingTime.trim() !== '' ||
        day.closingTime.trim() !== '' ||
        Number(day.price) !== 0)
    );
  }

  private getCoveredDays(dayType: string): string[] {
    if (dayType === 'DIA_DE_SEMANA') {
      return [...this.weekdays];
    }

    if (dayType === 'FIN_DE_SEMANA') {
      return [...this.weekend];
    }

    return [dayType];
  }

  private scheduleCanOwnPricing(
    scheduleDayType: string,
    pricingDayType: string
  ): boolean {
    if (scheduleDayType === pricingDayType) {
      return true;
    }

    const scheduleDays = this.getCoveredDays(scheduleDayType);
    const pricingDays = this.getCoveredDays(pricingDayType);

    return pricingDays.every(day => scheduleDays.includes(day));
  }

  private getPricingsForSchedule(schedule: DaySchedule): PricingConfig[] {
    return this.getEnabledPricings().filter(config =>
      this.scheduleCanOwnPricing(schedule.dayType, config.dayType) &&
      config.openingTime >= schedule.openingTime &&
      config.closingTime <= schedule.closingTime
    );
  }

  private buildPricingDtos(schedule: DaySchedule): any[] {
    return this.getPricingsForSchedule(schedule).map(config => ({
      dayType: config.dayType,
      startTime: config.openingTime,
      endTime: config.closingTime,
      price: config.price
    }));
  }

  private buildPricingValidationRequest(spaceId: number): any[] {
    return this.getEnabledPricings().map(day => ({
      spaceId,
      pricing: {
        dayType: day.dayType,
        startTime: day.openingTime,
        endTime: day.closingTime,
        price: day.price
      }
    }));
  }

  private validatePricing(spaceId: number): Observable<any> {
    return this.spaceService.validatePricing(
      this.buildPricingValidationRequest(spaceId)
    );
  }

  private createSpace(): void {
    this.saving = true;

    this.spaceService.createSpace(this.space).subscribe({
      next: response => {
        const createdSpaceId = response?.id;

        if (!createdSpaceId) {
          this.saving = false;
          this.errorMessage =
            'El espacio fue creado pero el backend no devolvió su ID.';
          return;
        }

        this.createSchedulesAndPricings(createdSpaceId);
      },
      error: error => {
        this.saving = false;
        this.errorMessage = this.getSpaceErrorMessage(error);
      }
    });
  }

  private createSchedulesAndPricings(spaceId: number): void {
    const schedules = this.getEnabledSchedules();

    if (schedules.length === 0) {
      this.saving = false;
      this.errorMessage = 'Debés agregar al menos un horario.';
      return;
    }

    this.validatePricing(spaceId).subscribe({
      next: () => {
        from(schedules)
          .pipe(
            concatMap(schedule =>
              this.spaceService.addSchedule({
                spaceId,
                schedule: {
                  dayType: schedule.dayType,
                  openingTime: schedule.openingTime,
                  closingTime: schedule.closingTime
                },
                pricings: this.buildPricingDtos(schedule)
              }).pipe(
                tap(response => {
                  schedule.id = response?.id ?? response?.scheduleId;
                  schedule.spaceId = this.spaceId!;

                  if (
                    schedule.id != null &&
                    !this.originalSchedules.some(
                      original => original.id === schedule.id
                    )
                  ) {
                    this.originalSchedules.push({
                      ...schedule
                    });
                  }
                })
              )
            ),
            toArray()
          )
          .subscribe({
            next: () => {
              this.saving = false;
              this.close.emit(true);
            },
            error: error => {
              this.saving = false;
              this.errorMessage = this.getSpaceErrorMessage(error);
            }
          });
      },
      error: error => {
        this.saving = false;
        this.errorMessage = this.getSpaceErrorMessage(error);
      }
    });
  }

  private updateExistingSpace(): void {
    this.saving = true;

    const spaceRequest = {
      spaceId: this.spaceId,
      ...this.space
    };

    this.spaceService.updateSpace(spaceRequest).subscribe({
      next: () => {
        this.updateSchedules();
      },
      error: error => {
        this.saving = false;
        this.errorMessage = this.getSpaceErrorMessage(error);
      }
    });
  }


  private updateSchedules(): void {
    if (this.spaceId === null) {
      this.saving = false;
      return;
    }

    const currentSchedules = this.getEnabledSchedules();

    const originalIds = this.originalSchedules
      .filter(schedule => schedule.id != null)
      .map(schedule => schedule.id!);

    const currentIds = currentSchedules
      .filter(schedule => schedule.id != null)
      .map(schedule => schedule.id!);

    const schedulesToDelete = originalIds.filter(
      id => !currentIds.includes(id)
    );

    const operations: Array<() => Observable<any>> = [];

    for (const scheduleId of schedulesToDelete) {
      operations.push(() =>
        this.spaceService.deleteSchedule(
          this.spaceId!,
          scheduleId
        ).pipe(
          tap(() => {
            this.originalSchedules = this.originalSchedules.filter(
              schedule => schedule.id !== scheduleId
            );
          })
        )
      );
    }

    for (const schedule of currentSchedules) {
      if (schedule.id != null) {
        operations.push(() =>
          this.spaceService.updateSchedule({
            spaceId: this.spaceId!,
            scheduleId: schedule.id,
            schedule: {
              dayType: schedule.dayType,
              openingTime: schedule.openingTime,
              closingTime: schedule.closingTime
            },
            pricings: this.buildPricingDtos(schedule)
          }).pipe(
            tap(response => {
              schedule.id = response?.id ?? schedule.id;
              schedule.spaceId = this.spaceId!;
            })
          )
        );
      } else {
        operations.push(() =>
          this.spaceService.addSchedule({
            spaceId: this.spaceId!,
            schedule: {
              dayType: schedule.dayType,
              openingTime: schedule.openingTime,
              closingTime: schedule.closingTime
            },
            pricings: this.buildPricingDtos(schedule)
          }).pipe(
            tap(response => {
              schedule.id = response?.id ?? response?.scheduleId;
              schedule.spaceId = this.spaceId!;
            })
          )
        );
      }
    }

    if (operations.length === 0) {
      this.saving = false;
      this.close.emit(true);
      return;
    }

    from(operations)
      .pipe(
        concatMap(operation => operation()),
        toArray()
      )
      .subscribe({
        next: () => {
          this.saving = false;
          this.close.emit(true);
        },
        error: error => {
          this.saving = false;
          this.errorMessage = this.getSpaceErrorMessage(error);
        }
      });
  }



  private validateForm(): boolean {
    const name = this.space.name?.trim() ?? '';

    if (!name) {
      this.errorMessage = 'El nombre del espacio es obligatorio.';
      return false;
    }

    if (name.length < 3) {
      this.errorMessage =
        'El nombre del espacio debe tener al menos 3 caracteres.';
      return false;
    }

    if (name.length > 100) {
      this.errorMessage =
        'El nombre del espacio no puede superar los 100 caracteres.';
      return false;
    }

    if (
      !Number.isFinite(this.space.fixedDeposit) ||
      this.space.fixedDeposit <= 0
    ) {
      this.errorMessage =
        'La seña fija debe ser un número mayor a 0.';
      return false;
    }

    const schedules = this.getEnabledSchedules();
    const configurations = this.getEnabledPricings();

    if (schedules.length === 0 || configurations.length === 0) {
      this.errorMessage =
        'No es posible guardar un espacio sin configuraciones de horarios y precios.';
      return false;
    }

    for (const schedule of schedules) {
      if (!this.validDayTypes.includes(schedule.dayType)) {
        this.errorMessage =
          'Seleccioná un tipo de día válido para el horario.';
        return false;
      }

      if (!schedule.openingTime || !schedule.closingTime) {
        this.errorMessage =
          `Completá el horario de ${schedule.label}.`;
        return false;
      }

      if (
        !this.isValidTime(schedule.openingTime) ||
        !this.isValidTime(schedule.closingTime)
      ) {
        this.errorMessage =
          `Ingresá horarios válidos para ${schedule.label}.`;
        return false;
      }

      if (schedule.closingTime <= schedule.openingTime) {
        this.errorMessage =
          `El horario de cierre debe ser posterior al de apertura en ${schedule.label}.`;
        return false;
      }
    }

    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        if (schedules[i].dayType === schedules[j].dayType) {
          this.errorMessage =
            `Ya existe un horario configurado para ${schedules[i].label}.`;
          return false;
        }
      }
    }

    for (const config of configurations) {
      if (!this.validDayTypes.includes(config.dayType)) {
        this.errorMessage =
          'Seleccioná un tipo de día válido para cada precio.';
        return false;
      }

      if (!config.openingTime || !config.closingTime) {
        this.errorMessage =
          `Completá el horario de ${config.label}.`;
        return false;
      }

      if (
        !this.isValidTime(config.openingTime) ||
        !this.isValidTime(config.closingTime)
      ) {
        this.errorMessage =
          `Ingresá horarios válidos para ${config.label}.`;
        return false;
      }

      if (config.closingTime <= config.openingTime) {
        this.errorMessage =
          `El horario de cierre debe ser posterior al de apertura en ${config.label}.`;
        return false;
      }

      if (!Number.isFinite(config.price) || config.price <= 0) {
        this.errorMessage =
          `El precio de ${config.label} debe ser un número mayor a 0.`;
        return false;
      }

      const matchingSchedules = schedules.filter(schedule =>
        this.scheduleCanOwnPricing(schedule.dayType, config.dayType)
      );

      if (matchingSchedules.length === 0) {
        this.errorMessage =
          `No hay un horario configurado que incluya ${config.label}.`;
        return false;
      }

      const compatibleSchedules = matchingSchedules.filter(schedule =>
        config.openingTime >= schedule.openingTime &&
        config.closingTime <= schedule.closingTime
      );

      if (compatibleSchedules.length === 0) {
        this.errorMessage =
          `La configuración de precio de ${config.label} debe estar dentro de los horarios disponibles (${matchingSchedules.map(schedule => `${schedule.openingTime} - ${schedule.closingTime}`).join(', ')}).`;
        return false;
      }

      if (compatibleSchedules.length > 1) {
        this.errorMessage =
          `La configuración de precio de ${config.label} coincide con varios horarios. Modificá las franjas para que cada precio corresponda a un único horario.`;
        return false;
      }
    }

    for (const schedule of schedules) {
      const pricingConfigurations = this.getPricingsForSchedule(schedule);

      if (pricingConfigurations.length === 0) {
        this.errorMessage =
          `Debés agregar al menos una configuración de precio para ${schedule.label}.`;
        return false;
      }
    }

    for (let i = 0; i < configurations.length; i++) {
      for (let j = i + 1; j < configurations.length; j++) {
        const first = configurations[i];
        const second = configurations[j];

        if (first.dayType !== second.dayType) {
          continue;
        }

        if (
          this.hasTimeOverlap(
            first.openingTime,
            first.closingTime,
            second.openingTime,
            second.closingTime
          )
        ) {
          this.errorMessage =
            `Hay horarios superpuestos para ${first.label}: ` +
            `${first.openingTime} - ${first.closingTime} ` +
            `y ${second.openingTime} - ${second.closingTime}.`;

          return false;
        }
      }
    }

    return true;
  }


  private isValidTime(time: string): boolean {
    return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time);
  }

  private hasTimeOverlap(
    startA: string,
    endA: string,
    startB: string,
    endB: string
  ): boolean {
    return startA < endB && startB < endA;
  }

  private getDayLabel(dayType: string): string {
    switch (dayType) {
      case 'DIA_DE_SEMANA':
        return 'Lunes a viernes';

      case 'FIN_DE_SEMANA':
        return 'Fin de semana';

      case 'LUNES':
        return 'Lunes';

      case 'MARTES':
        return 'Martes';

      case 'MIERCOLES':
        return 'Miércoles';

      case 'JUEVES':
        return 'Jueves';

      case 'VIERNES':
        return 'Viernes';

      case 'SABADO':
        return 'Sábado';

      case 'DOMINGO':
        return 'Domingo';

      default:
        return dayType;
    }
  }

  private formatTime(time: string): string {
    if (!time) {
      return '';
    }

    return time.substring(0, 5);
  }

  private getSpaceErrorMessage(error: any): string {
    const backendMessage = this.errorHandler.getMessage(error);

    const missingPriceMatch = backendMessage.match(
      /falta configurar precio desde las (\d{2}:\d{2}) hasta las (\d{2}:\d{2})/i
    );

    if (missingPriceMatch) {
      const startTime = missingPriceMatch[1];

      const relatedConfigIndex = this.days.findIndex(day =>
        day.enabled &&
        day.closingTime === startTime
      );

      if (relatedConfigIndex !== -1) {
        const relatedConfig = this.days[relatedConfigIndex];
        const configurationNumber = relatedConfigIndex + 1;

        return (
          `${backendMessage}. ` +
          `Revisá la Configuración ${configurationNumber} ` +
          `(${this.getDayLabel(relatedConfig.dayType)}).`
        );
      }
    }

    return backendMessage;
  }
}
