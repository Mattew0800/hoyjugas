import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../header/header';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Header,
    BottomNavbar
  ],
  templateUrl: './password.html',
  styleUrl: './password.scss'
})
export class ChangePassword {

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  constructor(
    private router: Router
  ) {}

  goBack(): void {
    this.router.navigate(['/profile']);
  }

  updatePassword(): void {
    console.log('Actualizar contraseña');
  }

  get hasMinLength(): boolean {
    return this.newPassword.length >= 8;
  }

  get hasNumberOrSpecial(): boolean {
    return /[0-9!@#$%^&*(),.?":{}|<>]/.test(this.newPassword);
  }

  get passwordsMatch(): boolean {
    return this.confirmPassword.length > 0 &&
      this.newPassword === this.confirmPassword;
  }
}
