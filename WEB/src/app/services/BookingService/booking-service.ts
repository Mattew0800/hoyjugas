import { Injectable } from '@angular/core';
import {getBookingApiUrl} from '../../config/api.config';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class BookingService {

  API_URL = getBookingApiUrl();

  constructor(public http: HttpClient) {
  }

  getAvaliableSlotsToday(){
    return this.http.get(`${this.API_URL}/available-slots-today`, { withCredentials: true });
  }

  getComplexSchedule(){
    return this.http.get(`${this.API_URL}/schedule`, { withCredentials: true });
  }

}
