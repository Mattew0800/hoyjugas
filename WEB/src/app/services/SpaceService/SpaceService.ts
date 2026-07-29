import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SpaceCardModel} from '../../screens/internal/models/space-card.model';
import {getBookingApiUrl, getSpaceApiUrl} from '../../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class SpaceService {

  private readonly spaceApiUrl = getSpaceApiUrl();

  constructor(private http: HttpClient) {}

  private readonly apiUrl = getBookingApiUrl();

  getSpaceCards(): Observable<SpaceCardModel[]> {
    return this.http.get<SpaceCardModel[]>(
      `${this.apiUrl}/spaces-card`,
      {
        withCredentials: true
      }
    );
  }

}
