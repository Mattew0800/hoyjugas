import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { RecurringBookingService } from '../../../../services/RecurringBookingService/recurring-booking-service';
import { ErrorHandlerService } from '../../../../services/ErrorHandlerService/error-handler.service';
import { RecurringBookingResponseModel } from '../../models/recurring-booking-response.model';
import { PageResponse } from '../../models/page-response.model';

export interface ClientProfileData {
  id: number;
  name: string;
  phone: string;
}

@Component({
  selector: 'app-client-profile-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-profile-modal.html',
  styleUrl: './client-profile-modal.scss'
})
export class ClientProfileModal implements OnDestroy {
  @Input({ required: true })
  client!: ClientProfileData;

  @Output()
  close = new EventEmitter<void>();

  activeView: 'profile' | 'history' = 'profile';

  history: RecurringBookingResponseModel[] = [];
  historyLoading = false;
  historyError = '';
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  private historySubscription?: Subscription;

  constructor(
    private recurringBookingService: RecurringBookingService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnDestroy(): void {
    this.historySubscription?.unsubscribe();
  }

  closeModal(): void {
    this.close.emit();
  }

  getClientInitial(): string {
    return this.client?.name?.charAt(0)?.toUpperCase() || '?';
  }

  showHistory(): void {
    this.activeView = 'history';
    this.currentPage = 0;
    this.loadHistory();
  }

  showProfile(): void {
    this.activeView = 'profile';
    this.historySubscription?.unsubscribe();
  }

  loadHistory(): void {
    if (!this.client?.id) {
      return;
    }

    this.historySubscription?.unsubscribe();
    this.historyLoading = true;
    this.historyError = '';

    this.historySubscription = this.recurringBookingService
      .getRecurringBookingsByClient({
        clientId: this.client.id,
        page: this.currentPage,
        size: this.pageSize,
        sortBy: 'startDate',
        sortDirection: 'desc'
      })
      .subscribe({
        next: (response: PageResponse<RecurringBookingResponseModel>) => {
          this.history = response.content ?? [];
          this.totalPages = response.totalPages ?? 0;
          this.totalElements = response.totalElements ?? this.history.length;
          this.historyLoading = false;
        },
        error: error => {
          this.historyLoading = false;
          this.historyError = this.errorHandler.getMessage(error);
        }
      });
  }

  previousPage(): void {
    if (this.currentPage <= 0 || this.historyLoading) {
      return;
    }

    this.currentPage--;
    this.loadHistory();
  }

  nextPage(): void {
    if (this.currentPage + 1 >= this.totalPages || this.historyLoading) {
      return;
    }

    this.currentPage++;
    this.loadHistory();
  }
}
