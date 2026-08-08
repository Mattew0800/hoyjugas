import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { getBookingApiUrl } from '../../config/api.config';

import { SpaceCardDTO } from '../../models/SpaceCardDTO';
import { AvailableSlotsResponse } from '../../models/AvailableSlotsResponse';

import { BookingFilterModel } from '../../screens/internal/models/booking-filter.model';
import { PageResponse } from '../../screens/internal/models/page-response.model';
import { BookingListModel } from '../../screens/internal/models/booking-list.model';

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

}
