import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  getSpaceApiUrl,
  getAdminSpaceApiUrl,
  getBookingApiUrl
} from '../../config/api.config';

import { SpaceCardModel } from '../../screens/internal/models/space-card.model';
import { SpaceListModel } from '../../screens/internal/models/space-list-model';

@Injectable({
  providedIn: 'root'
})
export class SpaceService {

  private readonly spaceApiUrl = getSpaceApiUrl();
  private readonly adminSpaceApiUrl = getAdminSpaceApiUrl();
  private readonly bookingApiUrl = getBookingApiUrl();

  constructor(
    private http: HttpClient
  ) {}

  getSpaceCards(): Observable<SpaceCardModel[]> {
    return this.http.get<SpaceCardModel[]>(
      `${this.bookingApiUrl}/spaces-card`,
      {
        withCredentials: true
      }
    );
  }

  getAllSpaces(): Observable<SpaceListModel[]> {
    return this.http.post<SpaceListModel[]>(
      `${this.adminSpaceApiUrl}/get-all`,
      {},
      {
        withCredentials: true
      }
    );
  }

  createSpace(space: any): Observable<any> {
    return this.http.post(
      `${this.adminSpaceApiUrl}/create`,
      space,
      {
        withCredentials: true
      }
    );
  }

  getSpaceDetail(spaceId: number): Observable<any> {
    return this.http.post(
      `${this.adminSpaceApiUrl}/detail`,
      { spaceId },
      {
        withCredentials: true
      }
    );
  }

  updateSpace(space: any): Observable<any> {
    return this.http.put(
      `${this.adminSpaceApiUrl}/update`,
      space,
      {
        withCredentials: true
      }
    );
  }

  addSchedule(request: any): Observable<any> {
    return this.http.post(
      `${this.adminSpaceApiUrl}/schedule/add`,
      request,
      {
        withCredentials: true
      }
    );
  }

  getSchedulesBySpace(spaceId: number): Observable<any[]> {
    return this.http.post<any[]>(
      `${this.adminSpaceApiUrl}/schedule/get-by-space`,
      { spaceId },
      {
        withCredentials: true
      }
    );
  }

  addPricing(request: any): Observable<any> {
    return this.http.post(
      `${this.adminSpaceApiUrl}/pricing/add`,
      request,
      {
        withCredentials: true
      }
    );
  }

  updateSchedule(request: any): Observable<any> {
    return this.http.put(
      `${this.adminSpaceApiUrl}/schedule/update`,
      request,
      {
        withCredentials: true
      }
    );
  }

  deleteSchedule(request: any): Observable<any> {
    return this.http.delete(
      `${this.adminSpaceApiUrl}/schedule/delete`,
      {
        body: request,
        withCredentials: true
      }
    );
  }

  updatePricing(request: any): Observable<any> {
    return this.http.put(
      `${this.adminSpaceApiUrl}/pricing/update`,
      request,
      {
        withCredentials: true
      }
    );
  }

  deletePricing(request: any): Observable<any> {
    return this.http.delete(
      `${this.adminSpaceApiUrl}/pricing/delete`,
      {
        body: request,
        withCredentials: true
      }
    );
  }
}
