import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getUserApiUrl, getAuthApiUrl } from '../../config/api.config';
import { UserUpdateDTO } from '../../models/UserUpdateDTO';
import {CustomerModel} from '../../screens/internal/models/user-response';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  USER_API_URL = getUserApiUrl();
  AUTH_API_URL = getAuthApiUrl();

  constructor(private http: HttpClient) {}

  getMe() {
    return this.http.get<any>(
      `${this.USER_API_URL}/me`,
      { withCredentials: true }
    );
  }

  updateMe(data: UserUpdateDTO) {
    return this.http.put(
      `${this.USER_API_URL}/me/update`,
      data,
      { withCredentials: true }
    );
  }

  getClients(enabled?: boolean) {
    let url = `${this.AUTH_API_URL}/clients`;

    if (enabled !== undefined) {
      url += `?enabled=${enabled}`;
    }

    return this.http.get<CustomerModel[]>(
      url,
      { withCredentials: true }
    );
  }

  desactivateUser(id: number) {
    return this.http.put(
      `${this.AUTH_API_URL}/deactivate-user`,
      { id },
      { withCredentials: true }
    );
  }

  activateUser(id: number) {
    return this.http.put(
      `${this.AUTH_API_URL}/activate-user`,
      { id },
      { withCredentials: true }
    );
  }
}
