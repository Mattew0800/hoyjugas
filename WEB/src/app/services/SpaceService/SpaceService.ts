import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  getSpaceApiUrl,
  getAdminSpaceApiUrl
} from '../../config/api.config';

import { SpaceCardModel } from '../../screens/internal/models/space-card.model';
import { SpaceListModel } from '../../screens/internal/models/space-list-model';
import {SpaceFormModel} from '../../screens/internal/models/space-form.model';

@Injectable({
  providedIn: 'root'
})
export class SpaceService {

  private readonly spaceApiUrl =
    getSpaceApiUrl();

  private readonly adminSpaceApiUrl =
    getAdminSpaceApiUrl();

  constructor(
    private http: HttpClient
  ) {}

  // Dashboard
  getSpaceCards(): Observable<SpaceCardModel[]> {

    return this.http.get<SpaceCardModel[]>(
      `${this.spaceApiUrl}/spaces-card`,
      {
        withCredentials: true
      }
    );

  }

  // Administración
  getAllSpaces(): Observable<SpaceListModel[]> {

    return this.http.post<SpaceListModel[]>(
      `${this.adminSpaceApiUrl}/get-all`,
      {},
      {
        withCredentials: true
      }
    );

  }

  createSpace(space: any) {

    return this.http.post(

      `${this.adminSpaceApiUrl}/create`,

      space,

      {

        withCredentials: true

      }

    );

  }

}
