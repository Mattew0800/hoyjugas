import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { getBookingApiUrl } from '../../config/api.config';

import { SpaceCardDTO } from '../../models/SpaceCardDTO';
import { AvailableSlotsResponse } from '../../models/AvailableSlotsResponse';

import { BookingFilterModel }
  from '../../screens/internal/models/booking-filter.model';

import { PageResponse }
  from '../../screens/internal/models/page-response.model';

import { BookingListModel }
  from '../../screens/internal/models/booking-list.model';

import { SpaceAvailabilityModel }
  from '../../screens/internal/models/space-availability.model';

import {InternalBookingRequestModel} from '../../screens/internal/models/internal-booking-request.model';

import { BookingResponseModel} from '../../screens/internal/models/booking-response.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private readonly bookingApiUrl = getBookingApiUrl();

  constructor(
    private http: HttpClient
  ) {}

  getBookings(
    filter: BookingFilterModel
  ): Observable<PageResponse<BookingListModel>> {

    return this.http.post<PageResponse<BookingListModel>>(
      `${this.bookingApiUrl}/list`,
      filter,
      {
        withCredentials: true
      }
    );

  }

  getAvailableSlotsToday(): Observable<AvailableSlotsResponse> {

    return this.http.get<AvailableSlotsResponse>(
      `${this.bookingApiUrl}/available-slots-today`,
      {
        withCredentials: true
      }
    );

  }

  getComplexSchedule(): Observable<{
    open?: boolean;
    openingTime?: string;
    closingTime?: string;
    dayType?: string;
  } & Record<string, unknown>> {

    return this.http.get<{
      open?: boolean;
      openingTime?: string;
      closingTime?: string;
      dayType?: string;
    } & Record<string, unknown>>(
      `${this.bookingApiUrl}/schedule`,
      {
        withCredentials: true
      }
    );

  }

  getSpacesCard(): Observable<SpaceCardDTO[]> {

    return this.http.get<SpaceCardDTO[]>(
      `${this.bookingApiUrl}/spaces-card`,
      {
        withCredentials: true
      }
    );

  }

  createInternalBooking(
    request: InternalBookingRequestModel
  ): Observable<BookingResponseModel> {

    return this.http.post<BookingResponseModel>(
      `${this.bookingApiUrl}/create`,
      request,
      {
        withCredentials: true
      }
    );

  }

  cancelBooking(request: {
    bookingId: number;
    cancellationReason: string;
    employeePin?: string;
    requesterId?: number;
  }): Observable<BookingResponseModel> {

    return this.http.post<BookingResponseModel>(
      `${this.bookingApiUrl}/cancel`,
      request,
      {
        withCredentials: true
      }
    );

  }

  getAvailability(
    spaceId: number,
    date: string
  ): Observable<SpaceAvailabilityModel[]> {

    return this.http.post<SpaceAvailabilityModel[]>(
      `${this.bookingApiUrl}/availability`,
      {
        spaceId,
        date
      },
      {
        withCredentials: true
      }
    );

  }

  getBookingDetail(request: {
    bookingId: number;
  }): Observable<BookingResponseModel> {

    return this.http.post<BookingResponseModel>(
      `${this.bookingApiUrl}/detail`,
      request,
      {
        withCredentials: true
      }
    );

  }

}
