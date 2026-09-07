import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  EmployeeCreateModel,
  EmployeeModel
} from '../../screens/internal/Employees/employee-modal/employee-modal';


export interface EmployeeCreatedResponse {

  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  pin?: string;

}


@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private readonly apiUrl =
    'http://localhost:8080/hoyjugas';


  constructor(
    private http: HttpClient
  ) {}


  getActiveStaff(): Observable<EmployeeModel[]> {

    return this.http.get<EmployeeModel[]>(
      `${this.apiUrl}/auth/view-current-staff`,
      {
        withCredentials: true
      }
    );

  }


  getAllStaff(): Observable<EmployeeModel[]> {

    return this.http.get<EmployeeModel[]>(
      `${this.apiUrl}/auth/view-history-staff`,
      {
        withCredentials: true
      }
    );

  }


  createEmployee(
    employee: EmployeeCreateModel
  ): Observable<EmployeeCreatedResponse> {

    return this.http.post<EmployeeCreatedResponse>(
      `${this.apiUrl}/auth/register-employee`,
      employee,
      {
        withCredentials: true
      }
    );

  }


  resetPin(
    id: number,
    pin: string
  ): Observable<EmployeeCreatedResponse> {

    return this.http.put<EmployeeCreatedResponse>(
      `${this.apiUrl}/auth/update-pin`,
      {
        id,
        pin
      },
      {
        withCredentials: true
      }
    );

  }


  dismissEmployee(
    id: number
  ): Observable<any> {

    return this.http.put(
      `${this.apiUrl}/auth/dismiss-employee`,
      {
        id
      },
      {
        withCredentials: true
      }
    );

  }

}
