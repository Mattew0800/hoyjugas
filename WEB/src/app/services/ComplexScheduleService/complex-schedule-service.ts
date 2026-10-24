import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { getComplexScheduleApiUrl } from '../../config/api.config';

import { ComplexScheduleResponseModel } from '../../screens/internal/models/complex-schedule-response.model';
import { ComplexScheduleRequestModel } from '../../screens/internal/models/complex-schedule-request.model';
import { ComplexScheduleUpdateRequestModel } from '../../screens/internal/models/complex-schedule-update-request.model';

@Injectable({
  providedIn: 'root'
})
export class ComplexScheduleService {

  private readonly apiUrl = getComplexScheduleApiUrl();

  constructor(
    private http: HttpClient
  ) {}

  getAll(): Observable<ComplexScheduleResponseModel[]> {
    return this.http.get<ComplexScheduleResponseModel[]>(
      `${this.apiUrl}/get-all`,
      {
        withCredentials: true
      }
    );
  }

  save(
    request: ComplexScheduleRequestModel
  ): Observable<ComplexScheduleResponseModel> {
    return this.http.post<ComplexScheduleResponseModel>(
      `${this.apiUrl}/save`,
      request,
      {
        withCredentials: true
      }
    );
  }

  update(
    request: ComplexScheduleUpdateRequestModel
  ): Observable<ComplexScheduleResponseModel> {
    return this.http.put<ComplexScheduleResponseModel>(
      `${this.apiUrl}/update`,
      request,
      {
        withCredentials: true
      }
    );
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/delete`,
      {
        body: { id },
        withCredentials: true
      }
    );
  }
}
