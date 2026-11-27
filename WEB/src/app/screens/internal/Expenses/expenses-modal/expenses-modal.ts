
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ExpenseService } from '../../../../services/ExpenseService/expense-service';
import { ErrorHandlerService } from '../../../../services/ErrorHandlerService/error-handler.service';

import {
  ExpenseConceptModel,
  ExpenseRequestModel,
  PaymentMethod
} from '../../models/expense.model';

import { SupplierModel } from '../../models/supplier.model';

@Component({
  selector: 'app-expenses-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './expenses-modal.html',
  styleUrl: './expenses-modal.scss'
})
export class ExpensesModal {

  @Input() concepts: ExpenseConceptModel[] = [];
  @Input() suppliers: SupplierModel[] = [];

  @Output() close = new EventEmitter<boolean>();

  conceptId: number | null = null;
  supplierId: number | null = null;

  amount: number | null = null;
  detail = '';
  voucher = '';
  employeePin = '';

  paymentMethod: PaymentMethod = 'EFECTIVO';

  saving = false;
  errorMessage = '';

  readonly paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'EFECTIVO', label: 'Efectivo' },
    { value: 'TRANSFERENCIA', label: 'Transferencia' },
    { value: 'MERCADOPAGO', label: 'Mercado Pago' },
    { value: 'DEBITO', label: 'Tarjeta de débito' },
    { value: 'CREDITO', label: 'Tarjeta de crédito' },
    { value: 'INTERNO', label: 'Interno' }
  ];

  constructor(
    private expenseService: ExpenseService,
    private errorHandler: ErrorHandlerService
  ) {}

  get activeConcepts(): ExpenseConceptModel[] {
    return this.concepts.filter(concept => concept.isActive);
  }

  cancel(): void {
    if (this.saving) {
      return;
    }

    this.close.emit(false);
  }

  saveExpense(): void {
    this.errorMessage = '';

    if (this.conceptId === null) {
      this.errorMessage = 'Seleccioná un concepto para el gasto.';
      return;
    }

    if (
      this.amount === null ||
      !Number.isFinite(this.amount) ||
      this.amount <= 0
    ) {
      this.errorMessage = 'Ingresá un importe válido mayor a cero.';
      return;
    }

    if (!this.detail.trim()) {
      this.errorMessage = 'Ingresá el detalle del gasto.';
      return;
    }

    if (!this.employeePin.trim()) {
      this.errorMessage = 'Ingresá el PIN del empleado.';
      return;
    }

    const request: ExpenseRequestModel = {
      conceptId: this.conceptId,
      amount: this.amount,
      detail: this.detail.trim(),
      paymentMethod: this.paymentMethod,
      employeePin: this.employeePin.trim(),
      voucher: this.voucher.trim() || undefined,
      supplierId: this.supplierId ?? undefined
    };

    this.saving = true;

    this.expenseService.createExpense(request).subscribe({
      next: () => {
        this.saving = false;
        this.close.emit(true);
      },
      error: error => {
        this.errorMessage = this.errorHandler.getMessage(error);
        this.saving = false;
      }
    });
  }
}
