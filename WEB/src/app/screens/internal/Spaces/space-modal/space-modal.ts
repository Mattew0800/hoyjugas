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

interface DayConfig {
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

  days: DayConfig[] = [];

  private originalPricings: DayConfig[] = [];

  constructor(
    private spaceService: SpaceService
  ) {}

  ngOnInit(): void {
    if (this.spaceId !== null) {
      this.loadSpace();
    } else {
      this.addConfiguration();
    }
  }

  private loadSpace(): void {
    this.errorMessage = '';

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

        const pricings = space.pricings ?? [];

        this.days = pricings.map((pricing: any) => ({
          id: pricing.id,
          label: this.getDayLabel(pricing.dayType),
          dayType: pricing.dayType,
          openingTime: this.formatTime(pricing.startTime),
          closingTime: this.formatTime(pricing.endTime),
          price: Number(pricing.price ?? 0),
          enabled: true
        }));

        this.originalPricings = this.days.map(day => ({
          ...day
        }));

        if (this.days.length === 0) {
          this.addConfiguration();
        }
      },

      error: err => {
        console.error('ERROR AL CARGAR ESPACIO:', err);
        this.errorMessage = this.getErrorMessage(err);
      }
    });
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

    if (index < 0 || index >= this.days.length) {
      return;
    }

    this.days.splice(index, 1);
    this.errorMessage = '';
  }

  onDayTypeChange(day: DayConfig): void {
    day.label = this.getDayLabel(day.dayType);
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
    } else {
      this.updateExistingSpace();
    }
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
      error: err => {
        this.saving = false;
        this.errorMessage = this.getErrorMessage(err);
        console.error('ERROR AL CREAR ESPACIO:', err);
      }
    });
  }

  private createSchedulesAndPricings(spaceId: number): void {
    const configurations = this.days.filter(day => day.enabled);

    if (configurations.length === 0) {
      this.saving = false;
      this.errorMessage =
        'Debés agregar al menos una configuración.';
      return;
    }

    const scheduleRequests: Observable<any>[] = [];
    const pricingRequests: Observable<any>[] = [];

    const dayTypes = [
      ...new Set(
        configurations.map(day => day.dayType)
      )
    ];

    for (const dayType of dayTypes) {
      const configs = configurations.filter(
        day => day.dayType === dayType
      );

      const openingTime = configs
        .map(day => day.openingTime)
        .sort()[0];

      const closingTime = configs
        .map(day => day.closingTime)
        .sort()
        .at(-1);

      if (!openingTime || !closingTime) {
        continue;
      }

      scheduleRequests.push(
        this.spaceService.addSchedule({
          spaceId,
          schedule: {
            dayType,
            openingTime,
            closingTime
          }
        })
      );
    }

    for (const config of configurations) {
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
        this.errorMessage = this.getErrorMessage(err);
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

    this.spaceService.updateSpace(spaceRequest).subscribe({
      next: () => {
        this.updatePricings();
      },
      error: err => {
        this.saving = false;
        this.errorMessage = this.getErrorMessage(err);
        console.error(
          'ERROR AL ACTUALIZAR ESPACIO:',
          err
        );
      }
    });
  }

  private updatePricings(): void {
    const current = this.days.filter(
      day => day.enabled
    );

    const currentIds = current
      .filter(day => day.id != null)
      .map(day => day.id!);

    const deleted = this.originalPricings.filter(
      original =>
        original.id != null &&
        !currentIds.includes(original.id)
    );

    const requests: Observable<any>[] = [];

    for (const config of deleted) {
      requests.push(
        this.spaceService.deletePricing({
          spaceId: this.spaceId,
          pricingId: config.id!
        })
      );
    }

    for (const config of current) {
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
        this.errorMessage = this.getErrorMessage(err);
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

    const configurations = this.days.filter(
      day => day.enabled
    );

    if (configurations.length === 0) {
      this.errorMessage =
        'Debés agregar al menos una configuración.';
      return false;
    }

    for (const config of configurations) {
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

    for (let i = 0; i < configurations.length; i++) {
      for (
        let j = i + 1;
        j < configurations.length;
        j++
      ) {
        const first = configurations[i];
        const second = configurations[j];

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

  private getErrorMessage(
    err: any
  ): string {
    return (
      err?.error?.message ||
      err?.error ||
      'Ocurrió un error al guardar la configuración.'
    );
  }
}
