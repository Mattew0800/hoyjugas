import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getUserApiUrl } from '../../config/api.config';
import {UserUpdateDTO} from '../../models/UserUpdateDTO';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  USER_API_URL = getUserApiUrl();

  constructor(
    private http: HttpClient
  ) {}

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

}
