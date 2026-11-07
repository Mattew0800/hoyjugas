import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';

import { ProductService } from '../../../../services/ProductService/product-service';
import { CategoryService } from '../../../../services/CategoryService/category-service';
import { SupplierService } from '../../../../services/SupplierService/supplier-service';
import { ErrorHandlerService } from '../../../../services/ErrorHandlerService/error-handler.service';
import{
    ProductRequestModel,
  ProductUpdateRequestModel,
  ProductDetailModel
} from '../../models/product.model';

import { CategoryModel } from '../../models/category.model';
import { SupplierModel } from '../../models/supplier.model';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './product-modal.html',
  styleUrl: './product-modal.scss'
})
export class ProductModal implements OnInit {

  @Input()
  productId: number | null = null;

  @Output()
  close = new EventEmitter<boolean>();

  saving = false;
  loading = false;

  errorMessage = '';
  warningMessage = '';

  categories: CategoryModel[] = [];
  suppliers: SupplierModel[] = [];

  product: ProductRequestModel = this.emptyProduct();

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private supplierService: SupplierService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  // PRODUCTO VACÍO

  private emptyProduct(): ProductRequestModel {
    return {
      internalCode: '',
      barcode: '',
      name: '',
      cost: 0,
      salePrice: 0,
      minimumStock: 0,
      categoryId: 0,
      supplierId: undefined
    };
  }

  // CARGA INICIAL

  private loadInitialData(): void {
    this.loading = true;
    this.errorMessage = '';
    this.warningMessage = '';

    forkJoin({
      categories: this.categoryService.getActiveCategories(),
      suppliers: this.supplierService.getActiveSuppliers(),
      product: this.productId !== null
        ? this.productService.getProduct(this.productId)
        : of(null)
    }).subscribe({
      next: result => {
        this.categories = result.categories;
        this.suppliers = result.suppliers;

        if (result.product !== null) {
          this.loadProductData(result.product);
        }

        this.loading = false;
      },

      error: error => {
        this.loading = false;
        this.errorMessage = this.errorHandler.getMessage(error);
      }
    });
  }

  // CARGA DE PRODUCTO PARA EDICIÓN

  private loadProductData(product: ProductDetailModel): void {
    this.product = {
      internalCode: product.internalCode ?? '',
      barcode: product.barcode ?? '',
      name: product.name ?? '',
      cost: Number(product.cost ?? 0),
      salePrice: Number(product.salePrice ?? 0),
      minimumStock: Number(product.minimumStock ?? 0),
      categoryId: this.findCategoryId(product.categoryName),
      supplierId: this.findSupplierId(product.supplierName)
    };

    if (this.product.categoryId === 0) {
      this.warningMessage =
        'No se pudo identificar automáticamente la categoría. Seleccionala manualmente.';
    }

    if (product.supplierName && !this.product.supplierId) {
      this.warningMessage +=
        ' No se pudo identificar automáticamente el proveedor. Seleccionalo manualmente.';
    }
  }

  // BUSCAR CATEGORÍA POR NOMBRE

  private findCategoryId(
    categoryName: string | null | undefined
  ): number {

    if (!categoryName) {
      return 0;
    }

    const category = this.categories.find(
      item =>
        item.name?.trim().toLowerCase() ===
        categoryName.trim().toLowerCase()
    );

    return category?.id ?? 0;
  }

  // BUSCAR PROVEEDOR POR NOMBRE

  private findSupplierId(
    supplierName: string | null | undefined
  ): number | undefined {

    if (!supplierName) {
      return undefined;
    }

    const supplier = this.suppliers.find(
      item =>
        item.name?.trim().toLowerCase() ===
        supplierName.trim().toLowerCase()
    );

    return supplier?.id;
  }

  // CERRAR MODAL

  closeModal(): void {
    if (!this.saving) {
      this.close.emit(false);
    }
  }

  // GUARDAR

  save(): void {
    this.errorMessage = '';

    if (this.loading || this.saving) {
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    if (this.productId === null) {
      this.createProduct();
      return;
    }

    this.updateProduct();
  }

  // VALIDACIONES

  private validateForm(): boolean {

    this.product.internalCode =
      this.product.internalCode.trim();

    this.product.barcode =
      this.product.barcode?.trim() ?? '';

    this.product.name =
      this.product.name.trim();

    if (!this.product.internalCode) {
      this.errorMessage =
        'El código interno es obligatorio.';
      return false;
    }

    if (!this.product.name) {
      this.errorMessage =
        'El nombre del producto es obligatorio.';
      return false;
    }

    if (this.product.name.length < 2) {
      this.errorMessage =
        'El nombre debe tener al menos 2 caracteres.';
      return false;
    }

    if (this.product.name.length > 150) {
      this.errorMessage =
        'El nombre no puede superar los 150 caracteres.';
      return false;
    }

    if (
      !Number.isFinite(this.product.cost) ||
      this.product.cost < 0
    ) {
      this.errorMessage =
        'El costo debe ser un número válido mayor o igual a 0.';
      return false;
    }

    if (
      !Number.isFinite(this.product.salePrice) ||
      this.product.salePrice <= 0
    ) {
      this.errorMessage =
        'El precio de venta debe ser mayor a 0.';
      return false;
    }

    if (
      !Number.isInteger(this.product.minimumStock) ||
      this.product.minimumStock < 0
    ) {
      this.errorMessage =
        'El stock mínimo debe ser un número entero mayor o igual a 0.';
      return false;
    }

    if (!this.product.categoryId) {
      this.errorMessage =
        'Seleccioná una categoría.';
      return false;
    }

    return true;
  }

  // CONSTRUIR REQUEST

  private buildRequest(): ProductRequestModel {

    const request: ProductRequestModel = {
      internalCode: this.product.internalCode,
      name: this.product.name,
      cost: Number(this.product.cost),
      salePrice: Number(this.product.salePrice),
      minimumStock: Number(this.product.minimumStock),
      categoryId: Number(this.product.categoryId)
    };

    if (this.product.barcode) {
      request.barcode = this.product.barcode;
    }

    if (this.product.supplierId) {
      request.supplierId = Number(this.product.supplierId);
    }

    return request;
  }

  // CREAR PRODUCTO

  private createProduct(): void {

    this.saving = true;

    this.productService
      .createProduct(this.buildRequest())
      .subscribe({
        next: () => {
          this.saving = false;
          this.close.emit(true);
        },

        error: error => {
          this.saving = false;
          this.errorMessage =
            this.errorHandler.getMessage(error);
        }
      });
  }

  // ACTUALIZAR PRODUCTO

  private updateProduct(): void {

    if (this.productId === null) {
      return;
    }

    this.saving = true;

    const request: ProductUpdateRequestModel = {
      id: this.productId,
      ...this.buildRequest()
    };

    this.productService
      .updateProduct(request)
      .subscribe({
        next: () => {
          this.saving = false;
          this.close.emit(true);
        },

        error: error => {
          this.saving = false;
          this.errorMessage =
            this.errorHandler.getMessage(error);
        }
      });
  }

}
