import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { getRecurringBookingApiUrl } from '../../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class RecurringBookingService {

  private readonly recurringBookingApiUrl =
    getRecurringBookingApiUrl();

  constructor(
    private http: HttpClient
  ) {}

  previewRecurringBooking(request: any): Observable<any> {

    return this.http.post(
      `${this.recurringBookingApiUrl}/preview`,
      request,
      {
        withCredentials: true
      }
    );

  }

  createRecurringBooking(request: any): Observable<any> {

    return this.http.post(
      `${this.recurringBookingApiUrl}/create`,
      request,
      {
        withCredentials: true
      }
    );

  }

}
