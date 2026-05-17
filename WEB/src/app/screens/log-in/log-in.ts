// log-in.ts

import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.html',
  imports: [
    FormsModule
  ],
  styleUrls: ['./log-in.scss']
})
export class LogIn {

  screenWidth = window.innerWidth;

  phoneNumber: string = '';
  password: string = '';

  constructor(private router: Router) {}

  continue(): void {
    console.log('Número:', this.phoneNumber);
  }

  goToOnboarding(): void {
    this.router.navigate(['/onboarding']);
  }

  goToSignUp(): void {
    this.router.navigate(['/sign-up']);
  }


}
