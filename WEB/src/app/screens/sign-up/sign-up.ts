// sign-up.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.html',
  imports: [
    FormsModule
  ],
  styleUrls: ['./sign-up.scss']
})
export class SignUp {

  screenWidth = window.innerWidth;

  fullName: string = '';
  phoneNumber: string = '';
  dni: string = '';
  email: string = '';

  password: string = '';
  confirmPassword: string = '';

  acceptedTerms: boolean = false;

  constructor(private router: Router) {}

  continue(): void {
    console.log('Registro');
  }

  goToLogin(): void {
    this.router.navigate(['/log-in']);
  }

}
