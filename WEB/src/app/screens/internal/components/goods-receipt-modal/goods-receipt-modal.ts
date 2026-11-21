
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProductService } from '../../../../services/ProductService/product-service';
import { SupplierService } from '../../../../services/SupplierService/supplier-service';
import { GoodsReceiptService } from '../../../../services/GoodsReciptService/goods-recipt-service';
import { ErrorHandlerService } from '../../../../services/ErrorHandlerService/error-handler.service';

import { ProductDetailModel } from '../../models/product.model';
import { SupplierModel } from '../../models/supplier.model';

import {
  GoodsReceiptPaymentMethod,
  GoodsReceiptRequest,
  GoodsReceiptResponse
} from '../../models/goods-recipt.model';

interface ReceiptCartItem {
  product: ProductDetailModel;
  quantity: number;
  unitCost: number;
  discount: number | null;
  newSalePrice: number | null;
}

@Component({
  selector: 'app-goods-receipt-modal',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './goods-receipt-modal.html',
  styleUrl: './goods-receipt-modal.scss'
})
export class GoodsReceiptModal implements OnInit {

  @Output() close = new EventEmitter<boolean>();

  suppliers: SupplierModel[] = [];
  products: ProductDetailModel[] = [];
  filteredProducts: ProductDetailModel[] = [];

  cart: ReceiptCartItem[] = [];

  selectedSupplierId: number | null = null;
  showProductSuggestions = false;

  productSearch = '';
  voucher = '';
  notes = '';
  employeePin = '';

  paymentMethod: GoodsReceiptPaymentMethod = 'EFECTIVO';

  loading = false;
  loadingProducts = false;
  submitting = false;

  errorMessage = '';
  successReceipt: GoodsReceiptResponse | null = null;

  private productRequestId = 0;

  readonly paymentMethods: {
    value: GoodsReceiptPaymentMethod;
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
    private productService: ProductService,
    private supplierService: SupplierService,
    private receiptService: GoodsReceiptService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadProducts();
  }

  private loadSuppliers(): void {
    this.loading = true;

    this.supplierService.getActiveSuppliers().subscribe({
      next: response => {
        this.suppliers = response;
        this.loading = false;
      },
      error: error => {
        this.loading = false;
        this.errorMessage = this.errorHandler.getMessage(error);
      }
    });
  }

  private loadProducts(): void {
    const requestId = ++this.productRequestId;

    this.loadingProducts = true;

    this.loadProductPage(0, [], requestId);
  }

  private loadProductPage(
    page: number,
    accumulated: ProductDetailModel[],
    requestId: number
  ): void {
    this.productService.getAllProducts({
      isActive: true,
      page,
      size: 100,
      sortBy: 'name',
      sortDirection: 'ASC'
    }).subscribe({
      next: response => {
        if (requestId !== this.productRequestId) {
          return;
        }

        const products = [
          ...accumulated,
          ...response.content
        ];

        if (!response.last) {
          this.loadProductPage(
            page + 1,
            products,
            requestId
          );
          return;
        }

        this.products = products;
        this.filterProducts();
        this.loadingProducts = false;
      },
      error: error => {
        if (requestId !== this.productRequestId) {
          return;
        }

        this.loadingProducts = false;
        this.errorMessage = this.errorHandler.getMessage(error);
      }
    });
  }

  filterProducts(): void {
    const term = this.productSearch.trim().toLowerCase();

    this.showProductSuggestions = term.length > 0;

    if (!term) {
      this.filteredProducts = [];
      return;
    }

    this.filteredProducts = this.products
      .filter(product => {
        const name = (product.name ?? '').toLowerCase();
        const code = (product.internalCode ?? '').toLowerCase();
        const barcode = String(product.barcode ?? '').toLowerCase();

        return (
          name.includes(term) ||
          code.includes(term) ||
          barcode.includes(term)
        );
      })
      .slice(0, 8);
  }

  addProduct(product: ProductDetailModel): void {
    this.errorMessage = '';

    const existing = this.cart.find(
      item => item.product.id === product.id
    );

    if (existing) {
      this.errorMessage = `${product.name} ya está agregado al ingreso.`;
      return;
    }

    this.cart.push({
      product,
      quantity: 1,
      unitCost: Number(product.cost),
      discount: null,
      newSalePrice: Number(product.salePrice)
    });

    this.productSearch = '';
    this.filteredProducts = [];
    this.showProductSuggestions = false;
  }

  removeProduct(item: ReceiptCartItem): void {
    this.cart = this.cart.filter(
      current => current.product.id !== item.product.id
    );
  }

  getSubtotal(item: ReceiptCartItem): number {
    return item.quantity * item.unitCost;
  }

  get totalAmount(): number {
    return this.cart.reduce(
      (total, item) => total + this.getSubtotal(item),
      0
    );
  }

  get totalUnits(): number {
    return this.cart.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }

  validate(): boolean {
    if (this.selectedSupplierId === null) {
      this.errorMessage = 'Seleccioná un proveedor.';
      return false;
    }

    if (this.cart.length === 0) {
      this.errorMessage = 'Agregá al menos un producto.';
      return false;
    }

    for (const item of this.cart) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        this.errorMessage =
          `La cantidad de ${item.product.name} debe ser mayor a cero.`;
        return false;
      }

      if (!Number.isFinite(item.unitCost) || item.unitCost <= 0) {
        this.errorMessage =
          `Ingresá un costo unitario válido para ${item.product.name}.`;
        return false;
      }

      if (
        item.newSalePrice !== null &&
        (!Number.isFinite(item.newSalePrice) || item.newSalePrice <= 0)
      ) {
        this.errorMessage =
          `El nuevo precio de ${item.product.name} debe ser mayor a cero.`;
        return false;
      }

      if (
        item.discount !== null &&
        (!Number.isFinite(item.discount) || item.discount < 0)
      ) {
        this.errorMessage =
          `El descuento de ${item.product.name} no es válido.`;
        return false;
      }
    }

    if (!this.employeePin.trim()) {
      this.errorMessage = 'Ingresá el PIN del empleado.';
      return false;
    }

    return true;
  }

  submit(): void {
    this.errorMessage = '';

    if (this.submitting || !this.validate()) {
      return;
    }

    const request: GoodsReceiptRequest = {
      supplierId: this.selectedSupplierId!,
      paymentMethod: this.paymentMethod,
      employeePin: this.employeePin.trim(),

      items: this.cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitCost: Number(item.unitCost),

        ...(item.discount !== null
          ? { discount: Number(item.discount) }
          : {}),

        ...(item.newSalePrice !== null
          ? { newSalePrice: Number(item.newSalePrice) }
          : {})
      }))
    };

    if (this.voucher.trim()) {
      request.voucher = this.voucher.trim();
    }

    if (this.notes.trim()) {
      request.notes = this.notes.trim();
    }

    this.submitting = true;

    this.receiptService.create(request).subscribe({
      next: response => {
        this.successReceipt = response;
        this.submitting = false;
      },
      error: error => {
        this.errorMessage = this.errorHandler.getMessage(error);
        this.submitting = false;
      }
    });
  }

  closeModal(): void {
    if (!this.submitting) {
      this.close.emit(false);
    }
  }

  finish(): void {
    this.close.emit(true);
  }
}
