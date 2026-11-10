import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { CategoryService } from '../../../../services/CategoryService/category-service';
import { InventoryService } from '../../../../services/InventoryService/inventory-service';
import { ErrorHandlerService } from '../../../../services/ErrorHandlerService/error-handler.service';

import { CategoryModel } from '../../models/category.model';

import {
  InventoryItemModel,
  InventoryItemRequestModel,
  InventoryItemUpdateRequestModel
} from '../../models/inventory.model';

interface InventoryFormModel {
  name: string;
  minimumQuantity: number;
  description: string;
  categoryId: number | null;
}

@Component({
  selector: 'app-inventory-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './inventory-modal.html',
  styleUrl: './inventory-modal.scss'
})
export class InventoryModal implements OnInit {

  @Input()
  item: InventoryItemModel | null = null;

  @Output()
  close = new EventEmitter<boolean>();

  saving = false;
  loading = false;

  errorMessage = '';
  warningMessage = '';

  categories: CategoryModel[] = [];

  form: InventoryFormModel = this.emptyForm();

  constructor(
    private inventoryService: InventoryService,
    private categoryService: CategoryService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  private emptyForm(): InventoryFormModel {
    return {
      name: '',
      minimumQuantity: 0,
      description: '',
      categoryId: null
    };
  }

  private loadInitialData(): void {
    this.loading = true;
    this.errorMessage = '';
    this.warningMessage = '';

    this.categoryService.getActiveCategories().subscribe({
      next: categories => {
        this.categories = categories;

        if (this.item !== null) {
          this.loadItemData(this.item);
        }

        this.loading = false;
      },

      error: error => {
        this.loading = false;
        this.errorMessage = this.errorHandler.getMessage(error);
      }
    });
  }

  private loadItemData(item: InventoryItemModel): void {
    this.form = {
      name: item.name ?? '',
      minimumQuantity: Number(item.minimumQuantity ?? 0),
      description: item.description ?? '',
      categoryId: this.findCategoryId(item.categoryName)
    };

    if (item.categoryName && this.form.categoryId === null) {
      this.warningMessage =
        'No se pudo identificar la categoría actual. Podés seleccionarla nuevamente o dejar el artículo sin categoría.';
    }
  }

  private findCategoryId(
    categoryName: string | null | undefined
  ): number | null {

    if (!categoryName) {
      return null;
    }

    const category = this.categories.find(
      item =>
        item.name?.trim().toLowerCase() ===
        categoryName.trim().toLowerCase()
    );

    return category?.id ?? null;
  }

  closeModal(): void {
    if (!this.saving) {
      this.close.emit(false);
    }
  }

  save(): void {
    this.errorMessage = '';

    if (this.loading || this.saving) {
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    if (this.item === null) {
      this.createItem();
      return;
    }

    this.updateItem();
  }

  private validateForm(): boolean {

    this.form.name = this.form.name.trim();
    this.form.description = this.form.description.trim();

    if (!this.form.name) {
      this.errorMessage = 'El nombre del artículo es obligatorio.';
      return false;
    }

    if (this.form.name.length < 2) {
      this.errorMessage =
        'El nombre debe tener al menos 2 caracteres.';
      return false;
    }

    if (this.form.name.length > 150) {
      this.errorMessage =
        'El nombre no puede superar los 150 caracteres.';
      return false;
    }

    if (
      !Number.isInteger(this.form.minimumQuantity) ||
      this.form.minimumQuantity < 0
    ) {
      this.errorMessage =
        'El stock mínimo debe ser un número entero mayor o igual a 0.';
      return false;
    }

    return true;
  }

  private buildRequest(): InventoryItemRequestModel {

    const request: InventoryItemRequestModel = {
      name: this.form.name,
      minimumQuantity: Number(this.form.minimumQuantity)
    };

    if (this.form.description) {
      request.description = this.form.description;
    }

    if (this.form.categoryId !== null) {
      request.categoryId = Number(this.form.categoryId);
    }

    return request;
  }

  private createItem(): void {

    this.saving = true;

    this.inventoryService
      .createItem(this.buildRequest())
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

  private updateItem(): void {

    if (this.item === null) {
      return;
    }

    this.saving = true;

    const request: InventoryItemUpdateRequestModel = {
      id: this.item.id,
      ...this.buildRequest()
    };

    this.inventoryService
      .updateItem(request)
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
