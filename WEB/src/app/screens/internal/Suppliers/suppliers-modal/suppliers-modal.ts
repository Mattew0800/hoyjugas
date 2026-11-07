
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  SupplierRequestModel,
  SupplierUpdateRequestModel,
  SupplierDetailModel
} from '../../models/supplier.model';

import { CategoryModel } from '../../models/category.model';

import { SupplierService } from '../../../../services/SupplierService/supplier-service';
import { CategoryService } from '../../../../services/CategoryService/category-service';
import { ErrorHandlerService } from '../../../../services/ErrorHandlerService/error-handler.service';

@Component({
  selector: 'app-suppliers-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './suppliers-modal.html',
  styleUrl: './suppliers-modal.scss'
})
export class SuppliersModal implements OnInit {

  @Input() supplierId: number | null = null;
  @Output() close = new EventEmitter<boolean>();

  supplierNumber = '';
  name = '';
  phone = '';
  cuit = '';
  categoryId: number | null = null;

  bank = '';
  accountNumber = '';
  accountType = '';
  paymentTermDays: number | null = null;

  accountTypes = [
    { value: 'CORRIENTE', label: 'Cuenta corriente' },
    { value: 'CAJA_DE_AHORRO', label: 'Caja de ahorro' }
  ];

  categories: CategoryModel[] = [];

  loading = false;
  saving = false;
  errorMessage = '';

  constructor(
    private supplierService: SupplierService,
    private categoryService: CategoryService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;

    this.categoryService.getActiveCategories().subscribe({
      next: (categories) => {
        this.categories = categories;

        if (this.supplierId !== null) {
          this.loadSupplier();
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        this.errorMessage = this.errorHandler.getMessage(error);
        this.loading = false;
      }
    });
  }

  loadSupplier(): void {
    this.supplierService.getSupplier(this.supplierId!).subscribe({
      next: (supplier: SupplierDetailModel) => {
        this.supplierNumber = supplier.supplierNumber;
        this.name = supplier.name;
        this.phone = supplier.phone;
        this.cuit = supplier.cuit;

        // El backend devuelve categoryName, pero no categoryId.
        // Se busca la categoría por nombre para poder seleccionarla.
        const category = this.categories.find(
          item => item.name === supplier.categoryName
        );

        this.categoryId = category?.id ?? null;

        this.bank = supplier.bank ?? '';
        this.accountNumber = supplier.accountNumber ?? '';
        this.accountType = supplier.accountType ?? '';
        this.paymentTermDays = supplier.paymentTermDays ?? null;

        if (!category) {
          this.errorMessage =
            'No se pudo identificar la categoría del proveedor. Revisá la selección antes de guardar.';
        }

        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = this.errorHandler.getMessage(error);
        this.loading = false;
      }
    });
  }

  saveSupplier(): void {
    this.errorMessage = '';

    if (
      !this.supplierNumber.trim() ||
      !this.name.trim() ||
      !this.phone.trim() ||
      !this.cuit.trim() ||
      this.categoryId === null
    ) {
      this.errorMessage = 'Completá todos los campos obligatorios.';
      return;
    }

    if (this.phone.trim().length < 10 || this.phone.trim().length > 20) {
      this.errorMessage = 'El teléfono debe tener entre 10 y 20 caracteres.';
      return;
    }

    if (this.cuit.trim().length < 11 || this.cuit.trim().length > 13) {
      this.errorMessage = 'El CUIT debe tener entre 11 y 13 caracteres.';
      return;
    }

    if (
      this.paymentTermDays !== null &&
      (this.paymentTermDays < 0 || !Number.isInteger(this.paymentTermDays))
    ) {
      this.errorMessage = 'El plazo de pago debe ser un número entero no negativo.';
      return;
    }

    this.saving = true;

    const supplierData: SupplierRequestModel = {
      supplierNumber: this.supplierNumber.trim(),
      name: this.name.trim(),
      phone: this.phone.trim(),
      cuit: this.cuit.trim(),
      categoryId: this.categoryId,
      ...(this.bank.trim() && { bank: this.bank.trim() }),
      ...(this.accountNumber.trim() && {
        accountNumber: this.accountNumber.trim()
      }),
      ...(this.accountType && { accountType: this.accountType }),
      ...(this.paymentTermDays !== null && {
        paymentTermDays: this.paymentTermDays
      })
    };

    if (this.supplierId !== null) {
      const supplier: SupplierUpdateRequestModel = {
        ...supplierData,
        id: this.supplierId
      };

      this.supplierService.updateSupplier(supplier).subscribe({
        next: () => {
          this.saving = false;
          this.close.emit(true);
        },
        error: (error) => {
          this.errorMessage = this.errorHandler.getMessage(error);
          this.saving = false;
        }
      });

    } else {
      this.supplierService.createSupplier(supplierData).subscribe({
        next: () => {
          this.saving = false;
          this.close.emit(true);
        },
        error: (error) => {
          this.errorMessage = this.errorHandler.getMessage(error);
          this.saving = false;
        }
      });
    }
  }

  cancel(): void {
    if (!this.saving) {
      this.close.emit(false);
    }
  }
}
