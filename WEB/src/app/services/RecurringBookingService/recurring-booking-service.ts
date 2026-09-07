import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getRecurringBookingApiUrl } from '../../config/api.config';
import { RecurringBookingRequestModel} from '../../screens/internal/models/recurring-booking-request.model';
import { RecurringBookingPreviewModel} from '../../screens/internal/models/recurring-booking-preview.model';
import { RecurringBookingResponseModel} from '../../screens/internal/models/recurring-booking-response.model';

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

}
