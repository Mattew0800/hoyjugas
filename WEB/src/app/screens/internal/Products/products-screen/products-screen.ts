
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';

import { ProductService } from '../../../../services/ProductService/product-service';
import { ErrorHandlerService } from '../../../../services/ErrorHandlerService/error-handler.service';

import { ProductDetailModel } from '../../models/product.model';

import { ProductModal } from '../product-modal/product-modal';
import { GoodsReceiptModal } from '../../components/goods-receipt-modal/goods-receipt-modal';

import { InternalHeader } from '../../components/internal-header/internal-header';
import { InternalSideBar } from '../../components/internal-side-bar/internal-side-bar';

@Component({
  selector: 'app-products-screen',
  standalone: true,
  imports: [
    FormsModule,
    CurrencyPipe,
    ProductModal,
    GoodsReceiptModal,
    InternalHeader,
    InternalSideBar
  ],
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

  showGoodsReceiptModal = false;

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  private togglingProductIds = new Set<number>();
  private productsRequestId = 0;

  constructor(
    private productService: ProductService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    const requestId = ++this.productsRequestId;

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
    };

    this.productService.getAllProducts(filters).subscribe({
      next: response => {
        if (requestId !== this.productsRequestId) {
          return;
        }

        this.products = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: error => {
        if (requestId !== this.productsRequestId) {
          return;
        }

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

  isProductStatusPending(productId: number): boolean {
    return this.togglingProductIds.has(productId);
  }

  toggleProductStatus(product: ProductDetailModel): void {
    if (this.isProductStatusPending(product.id)) {
      return;
    }

    const action = product.isActive ? 'desactivar' : 'activar';

    if (!confirm(`¿Querés ${action} el producto "${product.name}"?`)) {
      return;
    }

    this.togglingProductIds.add(product.id);
    this.errorMessage = '';

    this.productService.toggleProductStatus(product.id).subscribe({
      next: () => {
        product.isActive = !product.isActive;
        this.togglingProductIds.delete(product.id);
        this.loadProducts();
      },
      error: error => {
        this.togglingProductIds.delete(product.id);
        this.errorMessage = this.errorHandler.getMessage(error);
      }
    });
  }

  openGoodsReceiptModal(): void {
    this.showGoodsReceiptModal = true;
  }

  closeGoodsReceiptModal(reload: boolean): void {
    this.showGoodsReceiptModal = false;

    if (reload) {
      this.loadProducts();
    }
  }
}
