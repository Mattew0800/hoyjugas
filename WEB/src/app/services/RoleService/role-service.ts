import { Injectable } from '@angular/core';
import { AuthService } from '../AuthService/auth-service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(
    private authService: AuthService
  ) {}

  isAdmin(): boolean {
    return this.authService.currentUserValue?.role === 'ADMIN';
  }

  isEmployee(): boolean {
    return this.authService.currentUserValue?.role === 'EMPLOYEE';
  }

  isInternal(): boolean {
    return this.isAdmin() || this.isEmployee();
  }
}
