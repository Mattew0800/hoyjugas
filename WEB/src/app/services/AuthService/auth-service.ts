import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {User} from '../../models/User';
import {RegisterRequestDTO} from '../../models/RegisterRequestDTO';
import {LoginRequestDTO} from '../../models/LoginRequestDTO';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  API_URL = "http://localhost:8080/hoyjugas/auth";
  users : User[];

  constructor(public http: HttpClient) {
    this.users = [];
  }

  logUser(user: LoginRequestDTO){
    return this.http.post<LoginRequestDTO>(`${this.API_URL}/login`,user);

  }

  registerUser(user: RegisterRequestDTO){
    return this.http.post<RegisterRequestDTO>(`${this.API_URL}/register`,user);
  }

}
