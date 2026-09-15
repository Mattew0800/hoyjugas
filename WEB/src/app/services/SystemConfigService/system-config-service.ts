import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { getAdminConfigApiUrl } from '../../config/api.config';
import {SystemConfigModel} from '../../screens/internal/models/system-config.model';

@Injectable({
  providedIn: 'root'
})
export class SystemConfigService {

  private readonly apiUrl = getAdminConfigApiUrl();

  constructor(
    private http: HttpClient
  ) {}

  createConfig(
    config: SystemConfigModel
  ): Observable<SystemConfigModel> {

    return this.http.post<SystemConfigModel>(
      `${this.apiUrl}/create`,
      config,
      {
        withCredentials: true
      }
    );

  }

  updateConfig(
    config: SystemConfigModel
  ): Observable<SystemConfigModel> {

    return this.http.put<SystemConfigModel>(
      `${this.apiUrl}/update`,
      config,
      {
        withCredentials: true
      }
    );

  }
  getConfig(): Observable<SystemConfigModel> {
    return this.http.get<SystemConfigModel>(
      `${this.apiUrl}/get`,
      {
        withCredentials: true
      }
    );
  }

}
