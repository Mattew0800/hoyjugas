import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../header/header';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';
import {UserService} from '../../services/UserService/user-service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Header,
    BottomNavbar
  ],
  templateUrl: './password.html',
  styleUrl: './password.scss'
})
export class ChangePassword {

  passwordForm: FormGroup<{
    currentPassword: FormControl<string>;
    newPassword: FormControl<string>;
    confirmPassword: FormControl<string>;
  }>;

  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  successMessage = '';
  errorMessage = '';
  infoMessage = '';


  constructor(
    private router: Router,
    private userService: UserService
  ) {
    this.passwordForm = new FormGroup({
      currentPassword: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(1)] }),
      newPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8), Validators.pattern(/[0-9!@#$%^&*(),.?":{}|<>]/)]
      }),
      confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] })
    }, { validators: ChangePassword.passwordsMatchValidator });
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }

  updatePassword(): void {

    this.successMessage = '';
    this.errorMessage = '';
    this.infoMessage = '';

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.errorMessage = 'Completá los datos correctamente';

      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);
      return;
    }

    const value = this.passwordForm.getRawValue();
    const payload = {
      oldPassword: value.currentPassword ?? '',
      newPassword: value.newPassword ?? '',
      newNewPassword: value.confirmPassword ?? ''
    };

    if (payload.oldPassword === payload.newPassword) {
      this.infoMessage = 'La nueva contraseña debe ser diferente a la actual';

      setTimeout(() => {
        this.infoMessage = '';
      }, 3000);
      return;
    }

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
            this.errorMessage = '';
          }, 3000);
        }
      });

  }

  get hasMinLength(): boolean {
    return this.passwordForm.controls.newPassword.value.length >= 8;
  }

  get hasNumberOrSpecial(): boolean {
    return /[0-9!@#$%^&*(),.?":{}|<>]/.test(this.passwordForm.controls.newPassword.value);
  }

  get newPasswordLength(): number {
    return this.passwordForm.controls.newPassword.value.length;
  }

  get confirmPasswordLength(): number {
    return this.passwordForm.controls.confirmPassword.value.length;
  }

  get passwordsMatch(): boolean {
    const newPassword = this.passwordForm.controls.newPassword.value;
    const confirmPassword = this.passwordForm.controls.confirmPassword.value;
    return confirmPassword.length > 0 && newPassword === confirmPassword;
  }

  private static passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    return confirmPassword && newPassword !== confirmPassword
      ? { passwordsMismatch: true }
      : null;
  }
}
