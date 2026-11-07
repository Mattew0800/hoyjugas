
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryModel } from '../../models/category.model';
import { CategoryService } from '../../../../services/CategoryService/category-service';
import { ErrorHandlerService } from '../../../../services/ErrorHandlerService/error-handler.service';
import { InternalHeader } from '../../components/internal-header/internal-header';
import { InternalSideBar } from '../../components/internal-side-bar/internal-side-bar';
import { CategoryModal } from '../categories-modal/categories-modal';

@Component({
  selector: 'app-categories-screen',
  standalone: true,
  imports: [
    FormsModule,
    InternalHeader,
    InternalSideBar,
    CategoryModal
  ],
  templateUrl: './categories-screen.html',
  styleUrl: './categories-screen.scss'
})
export class CategoriesScreen implements OnInit {

  categories: CategoryModel[] = [];
  filteredCategories: CategoryModel[] = [];

  searchTerm = '';
  loading = false;
  errorMessage = '';

  showModal = false;
  selectedCategoryId: number | null = null;

  constructor(
    private categoryService: CategoryService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.errorMessage = '';

    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
        this.categories = response;
        this.filterCategories();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = this.errorHandler.getMessage(error);
        this.loading = false;
      }
    });
  }

  filterCategories(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredCategories = this.categories.filter(category =>
      category.code.toLowerCase().includes(term) ||
      category.name.toLowerCase().includes(term)
    );
  }

  openCreateModal(): void {
    this.selectedCategoryId = null;
    this.showModal = true;
  }

  openEditModal(category: CategoryModel): void {
    this.selectedCategoryId = category.id;
    this.showModal = true;
  }

  closeModal(updated: boolean): void {
    this.showModal = false;
    this.selectedCategoryId = null;

    if (updated) {
      this.loadCategories();
    }
  }

  toggleCategoryStatus(category: CategoryModel): void {
    const action = category.isActive ? 'desactivar' : 'activar';

    if (!confirm(`¿Estás seguro de que querés ${action} la categoría "${category.name}"?`)) {
      return;
    }

    this.categoryService.toggleCategoryStatus(category.id).subscribe({
      next: () => this.loadCategories(),
      error: (error) => {
        this.errorMessage = this.errorHandler.getMessage(error);
      }
    });
  }
}
