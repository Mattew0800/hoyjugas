
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ExpenseService } from '../../../../services/ExpenseService/expense-service';
import { SupplierService } from '../../../../services/SupplierService/supplier-service';
import { ErrorHandlerService } from '../../../../services/ErrorHandlerService/error-handler.service';

import { ExpensesModal } from '../expenses-modal/expenses-modal';

import {
  ExpenseConceptModel,
  ExpenseModel,
  PaymentMethod
} from '../../models/expense.model';

import { SupplierModel } from '../../models/supplier.model';

import { InternalHeader } from '../../components/internal-header/internal-header';
import { InternalSideBar } from '../../components/internal-side-bar/internal-side-bar';

@Component({
  selector: 'app-expenses-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InternalHeader,
    InternalSideBar,
    ExpensesModal
  ],
  templateUrl: './expenses-screen.html',
  styleUrl: './expenses-screen.scss'
})
export class ExpensesScreen implements OnInit {

  expenses: ExpenseModel[] = [];
  concepts: ExpenseConceptModel[] = [];
  suppliers: SupplierModel[] = [];

  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';

  showExpenseModal = false;
  showConceptModal = false;
  showConceptManagement = false;

  selectedConceptId: number | null = null;
  selectedSupplierId: number | null = null;

  dateFrom = '';
  dateTo = '';

  page = 0;
  pageSize = 20;
  totalPages = 0;
  totalElements = 0;

  conceptName = '';
  conceptIsExtra = false;

  readonly paymentMethods: {
    value: PaymentMethod;
    label: string;
  }[] = [
    { value: 'EFECTIVO', label: 'Efectivo' },
    { value: 'TRANSFERENCIA', label: 'Transferencia' },
    { value: 'MERCADOPAGO', label: 'Mercado Pago' },
    { value: 'DEBITO', label: 'Débito' },
    { value: 'CREDITO', label: 'Crédito' },
    { value: 'INTERNO', label: 'Interno' }
  ];

  constructor(
    private expenseService: ExpenseService,
    private supplierService: SupplierService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadConcepts();
    this.loadSuppliers();
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.loading = true;
    this.errorMessage = '';

    this.expenseService.getAllExpenses({
      conceptId: this.selectedConceptId,
      supplierId: this.selectedSupplierId,
      dateFrom: this.dateFrom
        ? `${this.dateFrom}:00`
        : null,
      dateTo: this.dateTo
        ? `${this.dateTo}:59`
        : null,
      page: this.page,
      size: this.pageSize,
      sortBy: 'date',
      sortDirection: 'desc'
    }).subscribe({
      next: response => {
        this.expenses = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: error => {
        this.errorMessage = this.errorHandler.getMessage(error);
        this.loading = false;
      }
    });
  }

  loadConcepts(): void {
    this.expenseService.getAllConcepts().subscribe({
      next: response => {
        this.concepts = response;
      },
      error: error => {
        this.errorMessage = this.errorHandler.getMessage(error);
      }
    });
  }

  loadSuppliers(): void {
    this.supplierService.getActiveSuppliers().subscribe({
      next: response => {
        this.suppliers = response;
      },
      error: error => {
        this.errorMessage = this.errorHandler.getMessage(error);
      }
    });
  }

  applyFilters(): void {
    this.page = 0;
    this.loadExpenses();
  }

  clearFilters(): void {
    this.selectedConceptId = null;
    this.selectedSupplierId = null;
    this.dateFrom = '';
    this.dateTo = '';
    this.page = 0;

    this.loadExpenses();
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadExpenses();
    }
  }

  nextPage(): void {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.loadExpenses();
    }
  }

  openExpenseModal(): void {
    this.errorMessage = '';
    this.showExpenseModal = true;
  }

  onExpenseModalClose(created: boolean): void {
    this.showExpenseModal = false;

    if (created) {
      this.page = 0;
      this.loadExpenses();
      this.successMessage = 'Gasto registrado correctamente.';
    }
  }

  openConceptModal(): void {
    this.conceptName = '';
    this.conceptIsExtra = false;
    this.errorMessage = '';
    this.showConceptModal = true;
  }

  closeConceptModal(): void {
    if (this.saving) {
      return;
    }

    this.showConceptModal = false;
  }

  saveConcept(): void {
    if (!this.conceptName.trim()) {
      this.errorMessage = 'Ingresá el nombre del concepto.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    this.expenseService.createConcept({
      name: this.conceptName.trim(),
      isExtra: this.conceptIsExtra
    }).subscribe({
      next: () => {
        this.saving = false;
        this.showConceptModal = false;
        this.successMessage = 'Concepto creado correctamente.';
        this.loadConcepts();
      },
      error: error => {
        this.errorMessage = this.errorHandler.getMessage(error);
        this.saving = false;
      }
    });
  }

  toggleConceptStatus(concept: ExpenseConceptModel): void {
    const action = concept.isActive ? 'desactivar' : 'activar';

    if (!confirm(
      `¿Querés ${action} el concepto "${concept.name}"?`
    )) {
      return;
    }

    this.expenseService.toggleConceptStatus(concept.id).subscribe({
      next: () => {
        this.loadConcepts();
        this.successMessage = 'Estado del concepto actualizado.';
      },
      error: error => {
        this.errorMessage = this.errorHandler.getMessage(error);
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 2
    }).format(value);
  }

  paymentMethodLabel(method: PaymentMethod): string {
    return this.paymentMethods.find(
      item => item.value === method
    )?.label ?? method;
  }

  get pageAmountTotal(): number {
    return this.expenses.reduce(
      (total, expense) => total + Number(expense.amount),
      0
    );
  }

  get activeConcepts(): ExpenseConceptModel[] {
    return this.concepts.filter(concept => concept.isActive);
  }

  getExpenseOrigin(expense: ExpenseModel): string {
    return expense.detail?.startsWith('Ingreso de mercadería -')
      ? 'Ingreso de mercadería'
      : 'Gasto manual';
  }
}
