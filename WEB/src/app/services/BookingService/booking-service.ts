import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { getBookingApiUrl } from '../../config/api.config';

import { SpaceCardDTO } from '../../models/SpaceCardDTO';
import { AvailableSlotsResponse } from '../../models/AvailableSlotsResponse';

import { BookingFilterModel } from '../../screens/internal/models/booking-filter.model';
import { PageResponse } from '../../screens/internal/models/page-response.model';
import { BookingListModel } from '../../screens/internal/models/booking-list.model';
import {SpaceAvailabilityModel} from '../../screens/internal/models/space-availability.model';

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

  getComplexSchedule() {

    return this.http.get<{
      open?: boolean;
      openingTime?: string;
      closingTime?: string;
      dayType?: string;
    } & Record<string, any>>(
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

  createBookingByEmployee(request: any) {
    return this.http.post(
      `${this.bookingApiUrl}/create`,
      request,
      { withCredentials: true }
    );
  }

  cancelBooking(request: {
    bookingId: number;
    cancellationReason: string;
    employeePin?: string;
    requesterId?: number;
  }) {
    return this.http.post(
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
        spaceId: spaceId,
        date: date
      },
      {
        withCredentials: true
      }
    );

  }

  private formatDateForApi(date: Date): string {

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      date.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;

  }

}
