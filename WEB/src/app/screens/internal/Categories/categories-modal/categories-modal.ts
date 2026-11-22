
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  CategoryRequestModel,
  CategoryUpdateRequestModel
} from '../../models/category.model';

import { CategoryService } from '../../../../services/CategoryService/category-service';
import { ErrorHandlerService } from '../../../../services/ErrorHandlerService/error-handler.service';

@Component({
  selector: 'app-category-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './categories-modal.html',
  styleUrl: './categories-modal.scss'
})
export class CategoryModal implements OnInit {

  @Input() categoryId: number | null = null;
  @Output() close = new EventEmitter<boolean>();

  code = '';
  name = '';

  loading = false;
  saving = false;
  errorMessage = '';

  constructor(
    private categoryService: CategoryService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    if (this.categoryId !== null) {
      this.loadCategory();
    }
  }

  loadCategory(): void {
    this.loading = true;
    this.errorMessage = '';

    this.categoryService.getCategory(this.categoryId!).subscribe({
      next: (category) => {
        this.code = category.code;
        this.name = category.name;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = this.errorHandler.getMessage(error);
        this.loading = false;
      }
    });
  }

  saveCategory(): void {
    this.errorMessage = '';

    const normalizedCode = this.code.trim();
    const normalizedName = this.name.trim();

    if (!normalizedCode || !normalizedName) {
      this.errorMessage = 'Completá todos los campos obligatorios.';
      return;
    }

    this.saving = true;

    if (this.categoryId !== null) {
      const category: CategoryUpdateRequestModel = {
        id: this.categoryId,
        code: normalizedCode,
        name: normalizedName
      };

      this.categoryService.updateCategory(category).subscribe({
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
      const category: CategoryRequestModel = {
        code: normalizedCode,
        name: normalizedName
      };

      this.categoryService.createCategory(category).subscribe({
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
