import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SpaceCardDTO } from '../../models/SpaceCardDTO';
import { Observable } from 'rxjs';
import {BookingFilterModel} from '../../screens/internal/models/booking-filter.model';
import {PageResponse} from '../../screens/internal/models/page-response.model';
import {BookingListModel} from '../../screens/internal/models/booking-list.model';
import {getBookingApiUrl} from '../../config/api.config';


@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private readonly bookingApiUrl = getBookingApiUrl();

  constructor(
    private http: HttpClient
  ) {
  }

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

}
