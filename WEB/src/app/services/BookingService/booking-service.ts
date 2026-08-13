import { Injectable } from '@angular/core';
import { getBookingApiUrl } from '../../config/api.config';
import { HttpClient } from '@angular/common/http';
import { SpaceCardDTO } from '../../models/SpaceCardDTO';

@Injectable({
  providedIn: 'root',
})
export class BookingService {

  API_URL = getBookingApiUrl();

  constructor(public http: HttpClient) {
  }

  getAvailableSlotsToday() {
    return this.http.get<AvailableSlotsResponse>(`${this.API_URL}/available-slots-today`, { withCredentials: true });
  }

  getComplexSchedule() {
    return this.http.get<{ open?: boolean, openingTime?: string, closingTime?: string, dayType?: string } & Record<string, any>>(`${this.API_URL}/schedule`, { withCredentials: true });
  }

  getSpacesCard() {
    return this.http.get<SpaceCardDTO[]>(`${this.API_URL}/spaces-card`, { withCredentials: true });
  }

}
