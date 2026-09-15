import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';

import { SpaceService } from '../../../../services/SpaceService/SpaceService';

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
  imports: [
    FormsModule
  ],
  templateUrl: './space-modal.html',
  styleUrl: './space-modal.scss'
})
export class SpaceModal implements OnInit {

  @Input()
  spaceId: number | null = null;

  @Output()
  close = new EventEmitter<boolean>();

  saving = false;
  errorMessage = '';

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

  private originalPricings: PricingConfig[] = [];
  private originalSchedules: DaySchedule[] = [];

  constructor(
    private spaceService: SpaceService
  ) {}

  ngOnInit(): void {
    if (this.spaceId !== null) {
      this.loadSpace();
    } else {
      this.addSchedule();
      this.addConfiguration();
    }
  }

  private loadSpace(): void {
    this.errorMessage = '';

    forkJoin({
      space: this.spaceService.getSpaceDetail(this.spaceId!),
      schedules: this.spaceService.getSchedulesBySpace(this.spaceId!)
    }).subscribe({
      next: ({ space, schedules }) => {

        this.space = {
          name: space.name ?? '',
          type: space.type ?? 'CANCHA',
          slotDuration: Number(space.slotDuration ?? 60),
          isActive: space.isActive ?? true,
          fixedDeposit: Number(space.fixedDeposit ?? 0),
          photoUrl: space.photoUrl ?? ''
        };

        this.schedules = schedules.map(
          (schedule: any) => ({
            id: schedule.id,
            spaceId: schedule.spaceId,
            label: this.getDayLabel(schedule.dayType),
            dayType: schedule.dayType,
            openingTime: this.formatTime(schedule.openingTime),
            closingTime: this.formatTime(schedule.closingTime),
            enabled: true
          })
        );

        this.originalSchedules = this.schedules.map(schedule => ({
          ...schedule
        }));

        const pricings = space.pricings ?? [];

        this.days = pricings.map(
          (pricing: any) => ({
            id: pricing.id,
            label: this.getDayLabel(pricing.dayType),
            dayType: pricing.dayType,
            openingTime: this.formatTime(pricing.startTime),
            closingTime: this.formatTime(pricing.endTime),
            price: Number(pricing.price ?? 0),
            enabled: true
          })
        );

        this.originalPricings = this.days.map(day => ({
          ...day
        }));

        if (this.schedules.length === 0) {
          this.addSchedule();
        }

        if (this.days.length === 0) {
          this.addConfiguration();
        }
      },

      error: err => {
        console.error(
          'ERROR AL CARGAR ESPACIO:',
          err
        );

        this.errorMessage =
          this.getErrorMessage(err);
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
    if (this.saving) {
      return;
    }

    if (
      index < 0 ||
      index >= this.schedules.length
    ) {
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
    if (this.saving) {
      return;
    }

    if (
      index < 0 ||
      index >= this.days.length
    ) {
      return;
    }

    this.days.splice(index, 1);

    this.errorMessage = '';
  }

  onScheduleDayTypeChange(
    schedule: DaySchedule
  ): void {
    schedule.label =
      this.getDayLabel(schedule.dayType);

    this.errorMessage = '';
  }

  onDayTypeChange(
    day: PricingConfig
  ): void {
    day.label =
      this.getDayLabel(day.dayType);

    this.errorMessage = '';
  }

  closeModal(): void {
    if (!this.saving) {
      this.close.emit(false);
    }
  }

  save(): void {
    this.errorMessage = '';

    if (!this.validateForm()) {
      return;
    }

    if (this.spaceId === null) {
      this.createSpace();
      return;
    }

    this.updateExistingSpace();
  }

  private buildPricingValidationRequest(
    spaceId: number
  ): any[] {
    return this.days
      .filter(day => day.enabled)
      .map(day => ({
        spaceId,
        pricing: {
          dayType: day.dayType,
          startTime: day.openingTime,
          endTime: day.closingTime,
          price: day.price
        }
      }));
  }

  private validatePricing(
    spaceId: number
  ): Observable<any> {
    const requests =
      this.buildPricingValidationRequest(spaceId);

    return this.spaceService.validatePricing(
      requests
    );
  }

  private validatePricingAndSave(
    spaceId: number
  ): void {
    this.validatePricing(spaceId).subscribe({
      next: () => {
        this.updatePricings();
      },

      error: err => {

        this.restoreOriginalSchedules();

        this.errorMessage =
          this.getErrorMessage(err);

        this.saving = false;

        console.error(
          'ERROR AL VALIDAR PRECIOS:',
          err
        );
      }
    });
  }

  private restoreOriginalSchedules(): void {
    const requests: Observable<any>[] = [];

    for (
      const schedule of this.originalSchedules
      ) {
      if (schedule.id == null) {
        continue;
      }

      requests.push(
        this.spaceService.updateSchedule({
          scheduleId: schedule.id,
          spaceId: schedule.spaceId ?? this.spaceId,
          dayType: schedule.dayType,
          openingTime: schedule.openingTime,
          closingTime: schedule.closingTime
        })
      );
    }

    if (requests.length === 0) {
      return;
    }

    forkJoin(requests).subscribe({
      error: err => {
        console.error(
          'ERROR AL RESTAURAR HORARIOS:',
          err
        );
      }
    });
  }

  private createSpace(): void {
    this.saving = true;

    this.spaceService.createSpace(
      this.space
    ).subscribe({
      next: response => {
        const createdSpaceId =
          response?.id;

        if (!createdSpaceId) {
          this.saving = false;

          this.errorMessage =
            'El espacio fue creado pero el backend no devolvió su ID.';

          return;
        }

        this.createSchedulesAndPricings(
          createdSpaceId
        );
      },

      error: err => {
        this.saving = false;

        this.errorMessage =
          this.getErrorMessage(err);

        console.error(
          'ERROR AL CREAR ESPACIO:',
          err
        );
      }
    });
  }

  private createSchedulesAndPricings(
    spaceId: number
  ): void {
    const schedules =
      this.schedules.filter(
        schedule => schedule.enabled
      );

    const configurations =
      this.days.filter(
        day => day.enabled
      );

    if (schedules.length === 0) {
      this.saving = false;

      this.errorMessage =
        'Debés agregar al menos un horario.';

      return;
    }

    if (configurations.length === 0) {
      this.saving = false;

      this.errorMessage =
        'Debés agregar al menos una configuración.';

      return;
    }

    const scheduleRequests: Observable<any>[] = [];
    const pricingRequests: Observable<any>[] = [];

    /*
     * Un schedule por dayType.
     */
    for (
      const schedule of schedules
      ) {
      scheduleRequests.push(
        this.spaceService.addSchedule({
          spaceId,
          schedule: {
            dayType: schedule.dayType,
            openingTime: schedule.openingTime,
            closingTime: schedule.closingTime
          }
        })
      );
    }

    for (
      const config of configurations
      ) {
      pricingRequests.push(
        this.spaceService.addPricing({
          spaceId,
          pricing: {
            dayType: config.dayType,
            startTime: config.openingTime,
            endTime: config.closingTime,
            price: config.price
          }
        })
      );
    }

    const requests = [
      ...scheduleRequests,
      ...pricingRequests
    ];

    if (requests.length === 0) {
      this.saving = false;

      this.errorMessage =
        'No hay configuraciones para guardar.';

      return;
    }

    forkJoin(requests).subscribe({
      next: () => {
        this.saving = false;

        this.close.emit(true);
      },

      error: err => {
        this.saving = false;

        this.errorMessage =
          this.getErrorMessage(err);

        console.error(
          'ERROR AL GUARDAR CONFIGURACIONES:',
          err
        );
      }
    });
  }

  private updateExistingSpace(): void {
    this.saving = true;

    const spaceRequest = {
      spaceId: this.spaceId,
      ...this.space
    };

    this.spaceService.updateSpace(
      spaceRequest
    ).subscribe({
      next: () => {
        this.updateSchedules();
      },

      error: err => {
        this.saving = false;

        this.errorMessage =
          this.getErrorMessage(err);

        console.error(
          'ERROR AL ACTUALIZAR ESPACIO:',
          err
        );
      }
    });
  }

  private updateSchedules(): void {
    const currentSchedules =
      this.schedules.filter(
        schedule => schedule.enabled
      );

    const originalIds =
      this.originalSchedules
        .filter(schedule => schedule.id != null)
        .map(schedule => schedule.id!);

    const currentIds =
      currentSchedules
        .filter(schedule => schedule.id != null)
        .map(schedule => schedule.id!);

    const requests: Observable<any>[] = [];

    for (
      const schedule of currentSchedules
      ) {
      if (schedule.id == null) {
        continue;
      }

      requests.push(
        this.spaceService.updateSchedule({
          scheduleId: schedule.id,
          spaceId: this.spaceId,
          dayType: schedule.dayType,
          openingTime: schedule.openingTime,
          closingTime: schedule.closingTime
        })
      );
    }

    for (
      const schedule of currentSchedules
      ) {
      if (schedule.id != null) {
        continue;
      }

      requests.push(
        this.spaceService.addSchedule({
          spaceId: this.spaceId,
          schedule: {
            dayType: schedule.dayType,
            openingTime: schedule.openingTime,
            closingTime: schedule.closingTime
          }
        })
      );
    }

    /*
     * Eliminar schedules que fueron quitados.
     */
    for (
      const scheduleId of originalIds
      ) {
      if (currentIds.includes(scheduleId)) {
        continue;
      }

      requests.push(
        this.spaceService.deleteSchedule({
          scheduleId,
          spaceId: this.spaceId
        })
      );
    }

    if (requests.length === 0) {
      this.validatePricingAndSave(
        this.spaceId!
      );

      return;
    }

    forkJoin(requests).subscribe({
      next: () => {
        this.validatePricingAndSave(
          this.spaceId!
        );
      },

      error: err => {
        this.saving = false;

        this.errorMessage =
          this.getErrorMessage(err);

        console.error(
          'ERROR AL ACTUALIZAR HORARIOS:',
          err
        );
      }
    });
  }

  private updatePricings(): void {
    const current =
      this.days.filter(
        day => day.enabled
      );

    const currentIds =
      current
        .filter(day => day.id != null)
        .map(day => day.id!);

    const deleted =
      this.originalPricings.filter(
        original =>
          original.id != null &&
          !currentIds.includes(original.id)
      );

    const requests: Observable<any>[] = [];

    for (
      const config of deleted
      ) {
      requests.push(
        this.spaceService.deletePricing({
          spaceId: this.spaceId,
          pricingId: config.id!
        })
      );
    }

    for (
      const config of current
      ) {
      if (config.id != null) {
        requests.push(
          this.spaceService.updatePricing({
            spaceId: this.spaceId,
            pricingId: config.id,
            pricing: {
              dayType: config.dayType,
              startTime: config.openingTime,
              endTime: config.closingTime,
              price: config.price
            }
          })
        );
      } else {
        requests.push(
          this.spaceService.addPricing({
            spaceId: this.spaceId,
            pricing: {
              dayType: config.dayType,
              startTime: config.openingTime,
              endTime: config.closingTime,
              price: config.price
            }
          })
        );
      }
    }

    if (requests.length === 0) {
      this.saving = false;

      this.close.emit(true);

      return;
    }

    forkJoin(requests).subscribe({
      next: () => {
        this.saving = false;

        this.close.emit(true);
      },

      error: err => {
        this.saving = false;

        this.errorMessage =
          this.getErrorMessage(err);

        console.error(
          'ERROR AL ACTUALIZAR CONFIGURACIONES:',
          err
        );
      }
    });
  }

  private validateForm(): boolean {
    if (
      !this.space.name ||
      !this.space.name.trim()
    ) {
      this.errorMessage =
        'El nombre es obligatorio.';

      return false;
    }

    if (
      this.space.fixedDeposit === null ||
      this.space.fixedDeposit === undefined ||
      this.space.fixedDeposit <= 0
    ) {
      this.errorMessage =
        'La seña fija debe ser mayor a 0.';

      return false;
    }

    const schedules =
      this.schedules.filter(
        schedule => schedule.enabled
      );

    if (schedules.length === 0) {
      this.errorMessage =
        'Debés agregar al menos un horario.';

      return false;
    }

    /*
     * Validar horarios operativos.
     */
    for (
      const schedule of schedules
      ) {
      if (!schedule.dayType) {
        this.errorMessage =
          'Seleccioná el tipo de día del horario.';

        return false;
      }

      if (
        !schedule.openingTime ||
        !schedule.closingTime
      ) {
        this.errorMessage =
          `Completá el horario de ${schedule.label}.`;

        return false;
      }

      if (
        schedule.closingTime <=
        schedule.openingTime
      ) {
        this.errorMessage =
          `El horario de cierre debe ser posterior al de apertura en ${schedule.label}.`;

        return false;
      }
    }

    for (
      let i = 0;
      i < schedules.length;
      i++
    ) {
      for (
        let j = i + 1;
        j < schedules.length;
        j++
      ) {
        if (
          schedules[i].dayType ===
          schedules[j].dayType
        ) {
          this.errorMessage =
            `Ya existe un horario configurado para ${schedules[i].label}.`;

          return false;
        }
      }
    }

    const configurations =
      this.days.filter(
        day => day.enabled
      );

    if (configurations.length === 0) {
      this.errorMessage =
        'Debés agregar al menos una configuración.';

      return false;
    }

    for (
      const config of configurations
      ) {
      if (!config.dayType) {
        this.errorMessage =
          'Seleccioná el tipo de día.';

        return false;
      }

      if (
        !config.openingTime ||
        !config.closingTime
      ) {
        this.errorMessage =
          `Completá el horario de ${config.label}.`;

        return false;
      }

      if (
        config.closingTime <=
        config.openingTime
      ) {
        this.errorMessage =
          `El horario de cierre debe ser posterior al de apertura en ${config.label}.`;

        return false;
      }

      if (
        config.price === null ||
        config.price === undefined ||
        config.price <= 0
      ) {
        this.errorMessage =
          `El precio de ${config.label} debe ser mayor a 0.`;

        return false;
      }
    }

    for (
      let i = 0;
      i < configurations.length;
      i++
    ) {
      for (
        let j = i + 1;
        j < configurations.length;
        j++
      ) {
        const first =
          configurations[i];

        const second =
          configurations[j];

        if (
          first.dayType !==
          second.dayType
        ) {
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

    for (
      const config of configurations
      ) {
      const schedule =
        schedules.find(
          item =>
            item.dayType ===
            config.dayType
        );

      if (!schedule) {
        this.errorMessage =
          `No hay un horario configurado para ${config.label}.`;

        return false;
      }

      if (
        config.openingTime <
        schedule.openingTime ||
        config.closingTime >
        schedule.closingTime
      ) {
        this.errorMessage =
          `La configuración de precio de ${config.label} debe estar dentro del horario del espacio (${schedule.openingTime} - ${schedule.closingTime}).`;

        return false;
      }
    }

    return true;
  }

  private hasTimeOverlap(
    startA: string,
    endA: string,
    startB: string,
    endB: string
  ): boolean {
    return (
      startA < endB &&
      startB < endA
    );
  }

  private getDayLabel(
    dayType: string
  ): string {
    switch (dayType) {
      case 'DIA_DE_SEMANA':
        return 'Lunes a viernes';

      case 'SABADO':
        return 'Sábado';

      case 'DOMINGO':
        return 'Domingo';

      default:
        return dayType;
    }
  }

  private formatTime(
    time: string
  ): string {
    if (!time) {
      return '';
    }

    return time.substring(0, 5);
  }

  getErrorMessage(
    error: any
  ): string {
    const backendMessage =
      error?.error?.message ||
      error?.error ||
      error?.message ||
      'Ocurrió un error inesperado.';

    const missingPriceMatch =
      backendMessage.match(
        /falta configurar precio desde las (\d{2}:\d{2}) hasta las (\d{2}:\d{2})/i
      );

    if (missingPriceMatch) {
      const startTime =
        missingPriceMatch[1];

      const relatedConfigIndex =
        this.days.findIndex(
          day =>
            day.enabled &&
            day.closingTime === startTime
        );

      if (
        relatedConfigIndex !== -1
      ) {
        const relatedConfig =
          this.days[
            relatedConfigIndex
            ];

        const configurationNumber =
          relatedConfigIndex + 1;

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
