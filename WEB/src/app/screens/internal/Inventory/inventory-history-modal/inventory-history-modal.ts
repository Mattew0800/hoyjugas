
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  Inject
} from '@angular/core';

import { DOCUMENT, DatePipe } from '@angular/common';
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
export class InventoryHistoryModal implements OnInit, AfterViewInit {

  @Input({ required: true }) item!: InventoryItemModel;
  @Output() close = new EventEmitter<void>();

  @ViewChild('dialogElement')
  dialogElement!: ElementRef<HTMLElement>;

  @ViewChild('initialFocus')
  initialFocus!: ElementRef<HTMLButtonElement>;

  movements: InventoryMovementResponseModel[] = [];
  loading = false;
  errorMessage = '';

  typeFilter = 'TODOS';
  dateFrom = '';
  dateTo = '';
  searchMovement = '';

  private openerElement: HTMLElement | null = null;
  private closed = false;

  constructor(
    private inventoryService: InventoryService,
    private errorHandler: ErrorHandlerService,
    @Inject(DOCUMENT) private document: Document
  ) {
    const activeElement = this.document.activeElement;

    if (activeElement instanceof HTMLElement) {
      this.openerElement = activeElement;
    }
  }

  ngOnInit(): void {
    this.loadMovements();
  }

  ngAfterViewInit(): void {
    this.initialFocus.nativeElement.focus();
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

  onDialogKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeModal();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusableElements = this.dialogElement.nativeElement.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) {
      event.preventDefault();
      this.dialogElement.nativeElement.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = this.document.activeElement;

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
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
    if (this.closed) {
      return;
    }

    this.closed = true;
    this.openerElement?.focus();
    this.close.emit();
  }
}
