
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ProductService } from '../../../../services/ProductService/product-service';
import { ErrorHandlerService } from '../../../../services/ErrorHandlerService/error-handler.service';
import { CurrencyPipe } from '@angular/common';
import { ProductDetailModel } from '../../models/product.model';
import { ProductModal } from '../product-modal/product-modal';
import { InternalHeader } from '../../components/internal-header/internal-header';
import { InternalSideBar } from '../../components/internal-side-bar/internal-side-bar';

@Component({
  selector: 'app-products-screen',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, ProductModal, InternalHeader, InternalSideBar],
  templateUrl: './products-screen.html',
  styleUrl: './products-screen.scss'
})
export class ProductsScreen implements OnInit {

  products: ProductDetailModel[] = [];

  loading = false;
  errorMessage = '';

  searchTerm = '';
  lowStockOnly = false;
  showModal = false;
  selectedProductId: number | null = null;

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  constructor(
    private productService: ProductService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';

    const filters = {
      page: this.currentPage,
      size: this.pageSize,
      sortBy: 'name',
      sortDirection: 'ASC',
      ...(this.searchTerm.trim()
        ? { search: this.searchTerm.trim() }
        : {}),
      ...(this.lowStockOnly
        ? { lowStock: true }
        : {})
    };;

    this.productService.getAllProducts(filters).subscribe({
      next: response => {
        this.products = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: error => {
        this.loading = false;
        this.errorMessage = this.errorHandler.getMessage(error);
      }
    });
  }

  searchProducts(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

onLowStockChange(): void {
  this.currentPage = 0;
  this.loadProducts();
}

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 0;
    this.loadProducts();
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  nextPage(): void {
    if (this.currentPage + 1 < this.totalPages) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  openCreateModal(): void {
    this.selectedProductId = null;
    this.showModal = true;
  }

  openEditModal(productId: number): void {
    this.selectedProductId = productId;
    this.showModal = true;
  }

  closeModal(reload: boolean): void {
    this.showModal = false;
    this.selectedProductId = null;

    if (reload) {
      this.loadProducts();
    }
  }

  toggleProductStatus(product: ProductDetailModel): void {
    const action = product.isActive ? 'desactivar' : 'activar';

    if (!confirm(`¿Querés ${action} el producto "${product.name}"?`)) {
      return;
    }

    this.productService.toggleProductStatus(product.id).subscribe({
      next: () => this.loadProducts(),
      error: error => {
        this.errorMessage = this.errorHandler.getMessage(error);
      }
    });
  }
}
