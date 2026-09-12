import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { InternalHeader } from '../../components/internal-header/internal-header';
import { InternalSideBar } from '../../components/internal-side-bar/internal-side-bar';

import {SystemConfigModel} from '../../models/system-config.model';
import { SystemConfigService } from '../../../../services/SystemConfigService/system-config-service';

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
export class SystemConfigScreen {

  config: SystemConfigModel = {
    cancellationHoursLimit: 24,
    reminderHoursBeforeBooking: 24,
    termsAndConditions: '',
    recurringMonthsAhead: 3,
    recurringInitialDepositTurns: 1,
    recurringDepositMultiplier: 1,
    maxRecurringCancellations: 3
  };

  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private systemConfigService: SystemConfigService
  ) {}

  saveConfig(): void {
    if (this.saving) {
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.systemConfigService
      .updateConfig(this.config)
      .subscribe({
        next: () => {
          this.saving = false;
          this.successMessage =
            'La configuración se guardó correctamente.';
        },
        error: error => {
          console.error(
            'ERROR AL GUARDAR CONFIGURACIÓN:',
            error
          );

          this.saving = false;
          this.errorMessage =
            'No se pudo guardar la configuración.';
        }
      });
  }
}
