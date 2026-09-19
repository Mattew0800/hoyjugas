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
            'La configuración se guardó correctamente.';
        },

        error: error => {
          this.saving = false;
          this.errorMessage =
            this.errorHandler.getMessage(error);
        }
      });
  }
}
