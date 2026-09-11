import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../header/header';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';

export interface PaymentOption {
  id: string;
  title: string;
  description: string;
  amount: number;
}

@Component({
  selector: 'app-step-payment-selection',
  standalone: true,
  imports: [CommonModule, Header, BottomNavbar],
  templateUrl: './step-payment-selection.html',
  styleUrl: './step-payment-selection.scss',
})
export class StepPaymentSelection {

  // ── Opciones de pago ──────────────────────────────────────────────
  paymentOptions: PaymentOption[] = [
    {
      id: 'full',
      title: 'Pagar Total (100%)',
      description: 'Turno abonado por completo',
      amount: 20000,
    },
    {
      id: 'partial',
      title: 'Pagar Seña (50%)',
      description: 'Resto del pago en el complejo',
      amount: 10000,
    },
  ];

  // Preseleccionar la primera opción (pago total) al entrar al paso
  selectedPayment: PaymentOption = this.paymentOptions[0];

  constructor(private router: Router) {}

  selectPayment(option: PaymentOption): void {
    this.selectedPayment = option;
  }

  // ── Formato de moneda ─────────────────────────────────────────────
  formatAmount(amount: number): string {
    return `$${amount.toLocaleString('es-AR')}`;
  }

  // ── Navegación ────────────────────────────────────────────────────
  goBack(): void {
    this.router.navigate(['/field-schedule/date-selection']);
  }

  goToSuccess(): void {
    this.router.navigate(['/booking-success']);
  }
}
