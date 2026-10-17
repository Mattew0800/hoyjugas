import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { getRecurringBookingApiUrl } from '../../config/api.config';

import { RecurringBookingRequestModel } from '../../screens/internal/models/recurring-booking-request.model';
import { RecurringBookingPreviewModel } from '../../screens/internal/models/recurring-booking-preview.model';
import { RecurringBookingResponseModel } from '../../screens/internal/models/recurring-booking-response.model';
import {RecurringCancelResponseModel} from '../../screens/internal/models/recurring-cancel-response.model';
import {RecurringBookingDetailModel} from '../../screens/internal/models/recurring-booking-detail.model';
import {PageResponse} from '../../screens/internal/models/page-response.model';

@Injectable({
  providedIn: 'root'
})
export class RecurringBookingService {

  private readonly recurringBookingApiUrl =
    getRecurringBookingApiUrl();

  constructor(
    private http: HttpClient
  ) {}

  previewRecurringBooking(
    request: RecurringBookingRequestModel
  ): Observable<RecurringBookingPreviewModel> {
    return this.http.post<RecurringBookingPreviewModel>(
      `${this.recurringBookingApiUrl}/preview`,
      request,
      {
        withCredentials: true
      }
    );
  }

  createRecurringBooking(
    request: RecurringBookingRequestModel
  ): Observable<RecurringBookingResponseModel> {
    return this.http.post<RecurringBookingResponseModel>(
      `${this.recurringBookingApiUrl}/create`,
      request,
      {
        withCredentials: true
      }
    );
  }
  cancelOneBooking(
    request: {
      bookingId: number;
      cancellationReason: string;
      employeePin: string;
    }
  ): Observable<RecurringCancelResponseModel> {
    return this.http.post<RecurringCancelResponseModel>(
      `${this.recurringBookingApiUrl}/cancel-one`,
      request,
      {
        withCredentials: true
      }
    );
  }

  getRecurringBookingDetail(
    bookingId: number
  ): Observable<RecurringBookingDetailModel> {
    return this.http.post<RecurringBookingDetailModel>(
      `${this.recurringBookingApiUrl}/detail`,
      {
        recurringBookingId: bookingId
      },
      {
        withCredentials: true
      }
    );
  }

  cancelRecurringCycle(
    request: {
      recurringId: number;
      cancellationReason: string;
      employeePin: string;
    }
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.recurringBookingApiUrl}/cancel-cycle`,
      request,
      {
        withCredentials: true
      }
    );
  }

  getRecurringBookingsByClient(
    filters: {
      clientId?: number;
      spaceId?: number;
      status?: string;
      dayOfWeek?: string;
      cancelledByEmployeeId?: number;
      startDateFrom?: string;
      startDateTo?: string;
      page?: number;
      size?: number;
      sortBy?: string;
      sortDirection?: string;
    } = {}
  ): Observable<PageResponse<RecurringBookingResponseModel>> {
    return this.http.post<PageResponse<RecurringBookingResponseModel>>(
      `${this.recurringBookingApiUrl}/client-history`,
      filters,
      {
        withCredentials: true
      }
    );
  }
}
