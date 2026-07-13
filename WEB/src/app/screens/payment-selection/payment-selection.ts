import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router} from '@angular/router';
import {BottomNavbar} from '../bottom-navbar/bottom-navbar';
import {Header} from '../header/header';

@Component({
  selector: 'app-payment-selection',
  standalone: true,
  imports: [CommonModule, Header, BottomNavbar],
  templateUrl: './payment-selection.html',
  styleUrl: './payment-selection.scss'
})
export class PaymentSelection implements OnInit{

  booking!: {
    fieldName: string;
    date: string;
    startTime: string;
    endTime: string;
    userName: string;
    price: number;
  };

  constructor(
    private router: Router
  ) {}

  ngOnInit() {
    this.booking= history.state.bookingData;
    if(!this.booking){
      this.router.navigate(['/booking']);
      return;
    }
    this.totalPrice=this.booking.price;
  }

  totalPrice = 0;

  selectedPayment: 'full' | 'deposit' = 'deposit';

  selectPayment(option: 'full' | 'deposit'): void {
    this.selectedPayment = option;
  }

  get amountToPay(): number {
    return this.selectedPayment === 'full'
      ? this.totalPrice
      : this.totalPrice / 2;
  }

  proceedToMercadoPago(): void {
    console.log('Redirigir a Mercado Pago');
  }

  goBack(): void {
    history.back();
  }
}
