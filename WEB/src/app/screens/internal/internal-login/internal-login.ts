import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AuthService } from '../../../services/AuthService/auth-service';
import { LoginRequestDTO } from '../../../models/LoginRequestDTO';

@Component({
  selector: 'app-internal-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  templateUrl: './internal-login.html',
  styleUrl: './internal-login.scss'
})
export class InternalLogin {

  continueBoolean = false;

  showPassword = false;

  formErrorMsg = '';

  eyeIcon = faEye;
  eyeIconSlash = faEyeSlash;

  form: FormGroup;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {

    this.form = new FormGroup({

      email: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.maxLength(254)
      ]),

      password: new FormControl('', [
        Validators.required
      ])

    });

  }

  togglePasswordVisibility(): void {

    this.showPassword = !this.showPassword;

  }

  goBack(): void {

    this.continueBoolean = false;

    this.form.patchValue({
      password: ''
    });

    this.formErrorMsg = '';

    this.showPassword = false;

  }

  continue(): void {

    if (this.form.get('email')?.invalid) {

      this.form.get('email')?.markAsTouched();

      return;

    }

    this.formErrorMsg = '';

    this.continueBoolean = true;

  }

  login(): void {

    if (this.form.get('password')?.invalid) {

      this.form.get('password')?.markAsTouched();

      return;

    }

    const user: LoginRequestDTO = {

      email: this.form.value.email,

      password: this.form.value.password

    };

    this.formErrorMsg = '';

    this.authService.logUser(user).subscribe({

      next: loggedUser => {

        if (
          loggedUser.role === 'ADMIN' ||
          loggedUser.role === 'EMPLOYEE'
        ) {

          this.router.navigate(['/internal/dashboard']);

          return;

        }

        this.formErrorMsg =
          'No tiene permisos para acceder al sistema interno.';

        this.authService.logout().subscribe();

      },

      error: error => {

        console.error('ERROR LOGIN INTERNO:', error);

        this.formErrorMsg =
          'Email o contraseña incorrectos.';

      }

    });

  }

}
