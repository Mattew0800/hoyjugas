
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SupplierModel } from '../../models/supplier.model';

import { SupplierService } from '../../../../services/SupplierService/supplier-service';
import { ErrorHandlerService } from '../../../../services/ErrorHandlerService/error-handler.service';

import { InternalHeader } from '../../components/internal-header/internal-header';
import { InternalSideBar } from '../../components/internal-side-bar/internal-side-bar';
import { SuppliersModal } from '../suppliers-modal/suppliers-modal';

@Component({
  selector: 'app-suppliers-screen',
  standalone: true,
  imports: [
    FormsModule,
    InternalHeader,
    InternalSideBar,
    SuppliersModal
  ],
  templateUrl: './suppliers-screen.html',
  styleUrl: './suppliers-screen.scss'
})
export class SuppliersScreen implements OnInit {

  suppliers: SupplierModel[] = [];
  filteredSuppliers: SupplierModel[] = [];

  searchTerm = '';
  loading = false;
  errorMessage = '';

  showModal = false;
  selectedSupplierId: number | null = null;

  constructor(
    private supplierService: SupplierService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.supplierService.getAllSuppliers().subscribe({
      next: (response) => {
        this.suppliers = response;
        this.filterSuppliers();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = this.errorHandler.getMessage(error);
        this.loading = false;
      }
    });
  }

  filterSuppliers(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredSuppliers = this.suppliers.filter(supplier =>
      supplier.supplierNumber.toLowerCase().includes(term) ||
      supplier.name.toLowerCase().includes(term) ||
      supplier.cuit.toLowerCase().includes(term) ||
      (supplier.categoryName ?? '').toLowerCase().includes(term)
    );
  }

  openCreateModal(): void {
    this.selectedSupplierId = null;
    this.showModal = true;
  }

  openEditModal(supplier: SupplierModel): void {
    this.selectedSupplierId = supplier.id;
    this.showModal = true;
  }

  closeModal(updated: boolean): void {
    this.showModal = false;
    this.selectedSupplierId = null;

    if (updated) {
      this.loadSuppliers();
    }
  }

  toggleSupplierStatus(supplier: SupplierModel): void {
    const action = supplier.isActive ? 'desactivar' : 'activar';

    if (!confirm(
      `¿Estás seguro de que querés ${action} al proveedor "${supplier.name}"?`
    )) {
      return;
    }

    this.supplierService.toggleSupplierStatus(supplier.id).subscribe({
      next: () => this.loadSuppliers(),
      error: (error) => {
        this.errorMessage = this.errorHandler.getMessage(error);
      }
    });
  }
}
