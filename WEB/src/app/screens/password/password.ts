import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../header/header';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';
import {UserService} from '../../services/UserService/user-service';

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

  successMessage = '';
  errorMessage = '';


  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  goBack(): void {
    this.router.navigate(['/profile']);
  }

  updatePassword(): void {

    if (!this.passwordsMatch) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (!this.hasMinLength) {
      alert('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    const payload = {
      oldPassword: this.currentPassword,
      newPassword: this.newPassword,
      newNewPassword: this.confirmPassword
    };

    this.userService.updateMe(payload)
      .subscribe({
        next: () => {

          this.router.navigate(
            ['/profile'],
            {
              state: {
                passwordUpdated: true
              }
            }
          );

        },
        error: err => {
          console.error(err);
          this.errorMessage =
            'No se pudieron guardar los cambios';

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        }
      });

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
