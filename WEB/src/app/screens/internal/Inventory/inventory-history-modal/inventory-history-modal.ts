import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  InventoryItemModel,
  InventoryMovementResponseModel
} from '../../models/inventory.model';

import { InventoryService } from '../../../../services/InventoryService/inventory-service';
import { ErrorHandlerService } from '../../../../services/ErrorHandlerService/error-handler.service';

@Component({
  selector: 'app-inventory-history-modal',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './inventory-history-modal.html',
  styleUrl: './inventory-history-modal.scss',
})
export class InventoryHistoryModal implements OnInit {

  @Input({ required: true }) item!: InventoryItemModel;
  @Output() close = new EventEmitter<void>();

  movements: InventoryMovementResponseModel[] = [];
  loading = false;
  errorMessage = '';

  typeFilter: string = 'TODOS';
  dateFrom = '';
  dateTo = '';
  searchMovement = '';

  constructor(
    private inventoryService: InventoryService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadMovements();
  }

  get filteredMovements(): InventoryMovementResponseModel[] {
    return this.movements.filter(movement => {

      const matchesType =
        this.typeFilter === 'TODOS' ||
        movement.type === this.typeFilter;

      const movementDate = movement.createdAt.substring(0, 10);

      const matchesDateFrom =
        !this.dateFrom || movementDate >= this.dateFrom;

      const matchesDateTo =
        !this.dateTo || movementDate <= this.dateTo;

      const matchesSearch =
        movement.movementNumber
          .toLowerCase()
          .includes(this.searchMovement.trim().toLowerCase());

      return (
        matchesType &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesSearch
      );
    });
  }

  clearFilters(): void {
    this.typeFilter = 'TODOS';
    this.dateFrom = '';
    this.dateTo = '';
    this.searchMovement = '';
  }

  loadMovements(): void {
    this.loading = true;
    this.errorMessage = '';

    this.inventoryService.getMovementsByItem(this.item.id).subscribe({
      next: response => {
        this.movements = response;
        this.loading = false;
      },
      error: error => {
        this.loading = false;

        if (error.status === 404) {
          this.movements = [];
          return;
        }

        this.errorMessage = this.errorHandler.getMessage(error);
      }
    });
  }

  closeModal(): void {
    this.close.emit();
  }
}
