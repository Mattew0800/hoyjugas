import { Component } from '@angular/core';
import {Header} from '../header/header';
import {Router} from '@angular/router';
import {BottomNavbar} from '../bottom-navbar/bottom-navbar';

@Component({
  selector: 'app-step-payment-selection',
  imports: [Header,BottomNavbar],
  templateUrl: './step-payment-selection.html',
  styleUrl: './step-payment-selection.scss',
})
export class StepPaymentSelection {

  constructor(private router: Router){}

  goToSuccess() {
    this.router.navigate(['/booking-success']);
  }

}
