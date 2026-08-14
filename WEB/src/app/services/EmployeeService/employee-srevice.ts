import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {EmployeeCreateModel} from '../../screens/internal/Employees/employee-modal/employee-modal';

export interface EmployeeCreatedResponse {
  id: number;
  name: string;
  email: string;
  dni: string;
  phone: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private readonly apiUrl = 'http://localhost:8080/hoyjugas';

  constructor(
    private http: HttpClient
  ) {}

  createEmployee(
    employee: EmployeeCreateModel
  ): Observable<EmployeeCreatedResponse> {

    return this.http.post<EmployeeCreatedResponse>(
      `${this.apiUrl}/auth/register-employee`,
      employee
    );

  }

}
