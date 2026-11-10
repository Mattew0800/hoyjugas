import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { InventoryItemModel } from '../../models/inventory.model';
import { InventoryService } from '../../../../services/InventoryService/inventory-service';
import { ErrorHandlerService } from '../../../../services/ErrorHandlerService/error-handler.service';
import {InventoryModal} from '../inventory-modal/inventory-modal';
import { InternalHeader } from '../../components/internal-header/internal-header';
import { InternalSideBar } from '../../components/internal-side-bar/internal-side-bar';
import {InventoryMovementModal} from '../inventory-movement-modal/inventory-movement-modal';
import { InventoryHistoryModal } from '../inventory-history-modal/inventory-history-modal';

@Component({
  selector: 'app-inventory-screen',
  standalone: true,
  imports: [
    FormsModule,
    InternalHeader,
    InternalSideBar,
    InventoryModal,
    InventoryMovementModal,
    InventoryHistoryModal
  ],
  templateUrl: './inventory-screen.html',
  styleUrl: './inventory-screen.scss'
})
export class InventoryScreen implements OnInit {

  items: InventoryItemModel[] = [];
  filteredItems: InventoryItemModel[] = [];

  searchTerm = '';
  lowStockOnly = false;

  loading = false;
  errorMessage = '';

  showModal = false;
  selectedItem: InventoryItemModel | null = null;

  showMovementModal = false;
  selectedMovementItem: InventoryItemModel | null = null;

  showHistoryModal = false;
  selectedHistoryItem: InventoryItemModel | null = null;

  constructor(
    private inventoryService: InventoryService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadInventory();
  }

  loadInventory(): void {
    this.loading = true;
    this.errorMessage = '';

    this.inventoryService.getAllItems().subscribe({
      next: response => {
        this.items = response;
        this.filterItems();
        this.loading = false;
      },
      error: error => {
        this.errorMessage = this.errorHandler.getMessage(error);
        this.loading = false;
      }
    });
  }

  filterItems(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredItems = this.items.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(term) ||
        (item.categoryName ?? '').toLowerCase().includes(term);

      const matchesStock =
        !this.lowStockOnly || item.lowStock;

      return matchesSearch && matchesStock;
    });
  }

  get totalItems(): number {
    return this.items.length;
  }

  get lowStockItems(): number {
    return this.items.filter(item => item.lowStock).length;
  }

  get inactiveItems(): number {
    return this.items.filter(item => !item.isActive).length;
  }

  toggleItemStatus(item: InventoryItemModel): void {
    const action = item.isActive ? 'desactivar' : 'activar';

    if (!confirm(`¿Querés ${action} "${item.name}"?`)) {
      return;
    }

    this.inventoryService.toggleItemStatus(item.id).subscribe({
      next: () => this.loadInventory(),
      error: error => {
        this.errorMessage = this.errorHandler.getMessage(error);
      }
    });
  }

  openCreateModal(): void {
    this.selectedItem = null;
    this.showModal = true;
  }

  openEditModal(item: InventoryItemModel): void {
    this.selectedItem = item;
    this.showModal = true;
  }

  onModalClose(saved: boolean): void {
    this.showModal = false;
    this.selectedItem = null;

    if (saved) {
      this.loadInventory();
    }
  }

  openMovementModal(item: InventoryItemModel): void {
    this.selectedMovementItem = item;
    this.showMovementModal = true;
  }

  onMovementModalClose(saved: boolean): void {
    this.showMovementModal = false;
    this.selectedMovementItem = null;

    if (saved) {
      this.loadInventory();
    }
  }

  openHistoryModal(item: InventoryItemModel): void {
    this.selectedHistoryItem = item;
    this.showHistoryModal = true;
  }

  onHistoryModalClose(): void {
    this.showHistoryModal = false;
    this.selectedHistoryItem = null;
  }
}
