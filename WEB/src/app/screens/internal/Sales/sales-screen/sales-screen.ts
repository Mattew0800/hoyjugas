
import { Component, OnInit } from '@angular/core';
import {CurrencyPipe, DatePipe} from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProductListModel } from '../../models/product.model';
import { CustomerModel } from '../../models/user-response';
import {PaymentMethod,SaleResponseModel} from '../../models/sale.mode';

import { ProductService } from '../../../../services/ProductService/product-service';
import { UserService } from '../../../../services/UserService/user-service';
import { SaleService } from '../../../../services/SaleService/sale-service';
import { ErrorHandlerService } from '../../../../services/ErrorHandlerService/error-handler.service';

import { InternalHeader } from '../../components/internal-header/internal-header';
import { InternalSideBar } from '../../components/internal-side-bar/internal-side-bar';

interface CartItem {
  product: ProductListModel;
  quantity: number;
}

@Component({
  selector: 'app-sales-screen',
  standalone: true,
  imports: [
    FormsModule,
    CurrencyPipe,
    DatePipe,
    InternalHeader,
    InternalSideBar
  ],
  templateUrl: './sales-screen.html',
  styleUrl: './sales-screen.scss'
})
export class SalesScreen implements OnInit {

  products: ProductListModel[] = [];
  clients: CustomerModel[] = [];
  cart: CartItem[] = [];

  searchTerm = '';
  selectedClientId: number | null = null;
  paymentMethod: PaymentMethod = 'EFECTIVO';
  notes = '';
  employeePin = '';

  loadingProducts = false;
  loadingClients = false;
  submitting = false;

  errorMessage = '';
  successMessage = '';

  completedSale: SaleResponseModel | null = null;

  private productRequestId = 0;

  readonly paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'EFECTIVO', label: 'Efectivo' },
    { value: 'TRANSFERENCIA', label: 'Transferencia' },
    { value: 'MERCADOPAGO', label: 'Mercado Pago' },
    { value: 'DEBITO', label: 'Débito' },
    { value: 'CREDITO', label: 'Crédito' },
    { value: 'INTERNO', label: 'Interno' }
  ];

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private saleService: SaleService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadClients();
  }

  loadProducts(): void {
    const requestId = ++this.productRequestId;
    const search = this.searchTerm.trim();

    this.loadingProducts = true;
    this.errorMessage = '';

    this.loadProductPage(search, 0, [], requestId);
  }

  private loadProductPage(
    search: string,
    page: number,
    accumulated: ProductListModel[],
    requestId: number
  ): void {
    this.productService.getAllProducts({
      ...(search ? { search } : {}),
      isActive: true,
      page,
      size: 100,
      sortBy: 'name',
      sortDirection: 'ASC'
    }).subscribe({
      next: response => {
        // Ignorar respuestas de búsquedas anteriores.
        if (requestId !== this.productRequestId) {
          return;
        }

        const products = [...accumulated, ...response.content];

        if (!response.last) {
          this.loadProductPage(
            search,
            page + 1,
            products,
            requestId
          );
          return;
        }

        this.products = products;
        this.loadingProducts = false;
      },
      error: error => {
        if (requestId !== this.productRequestId) {
          return;
        }

        this.errorMessage = this.errorHandler.getMessage(error);
        this.loadingProducts = false;
        this.products = [];
      }
    });
  }

  loadClients(): void {
    this.loadingClients = true;

    this.userService.getClients(true).subscribe({
      next: response => {
        this.clients = response;
        this.loadingClients = false;
      },
      error: () => {
        this.loadingClients = false;
      }
    });
  }

  onSearchChange(): void {
    this.loadProducts();
  }

  addToCart(product: ProductListModel): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (product.stock <= 0) {
      this.errorMessage = `${product.name} no tiene stock disponible.`;
      return;
    }

    const existing = this.cart.find(
      item => item.product.id === product.id
    );

    if (existing) {
      if (existing.quantity >= product.stock) {
        this.errorMessage = `Stock máximo disponible para ${product.name}: ${product.stock}.`;
        return;
      }

      existing.quantity++;
      return;
    }

    this.cart.push({ product, quantity: 1 });
  }

  increaseQuantity(item: CartItem): void {
    if (item.quantity >= item.product.stock) {
      this.errorMessage = `Stock máximo disponible: ${item.product.stock}.`;
      return;
    }

    item.quantity++;
    this.errorMessage = '';
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      this.removeFromCart(item);
    }

    this.errorMessage = '';
  }

  removeFromCart(item: CartItem): void {
    this.cart = this.cart.filter(
      cartItem => cartItem.product.id !== item.product.id
    );
  }

  get totalItems(): number {
    return this.cart.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }

  get totalAmount(): number {
    return this.cart.reduce(
      (total, item) => total + item.product.salePrice * item.quantity,
      0
    );
  }

  getSubtotal(item: CartItem): number {
    return item.product.salePrice * item.quantity;
  }

  confirmSale(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.cart.length === 0) {
      this.errorMessage = 'Agregá al menos un producto.';
      return;
    }

    if (!this.employeePin.trim()) {
      this.errorMessage = 'Ingresá el PIN del empleado.';
      return;
    }

    const payload = {
      ...(this.selectedClientId !== null
        ? { clientId: this.selectedClientId }
        : {}),
      paymentMethod: this.paymentMethod,
      notes: this.notes.trim(),
      employeePin: this.employeePin.trim(),
      items: this.cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };

    this.submitting = true;

    this.saleService.createSale(payload).subscribe({
      next: response => {
        this.completedSale = response;
        this.cart = [];
        this.employeePin = '';
        this.notes = '';
        this.selectedClientId = null;
        this.paymentMethod = 'EFECTIVO';
        this.submitting = false;
        this.loadProducts();
      },
      error: error => {
        this.errorMessage = this.errorHandler.getMessage(error);
        this.submitting = false;
        this.loadProducts();
      }
    });
  }

  closeCompletedSale(): void {
    this.completedSale = null;
  }

  newSale(): void {
    this.completedSale = null;
    this.errorMessage = '';
    this.successMessage = '';
  }
}
