import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';


import {InventoryItemModel,InventoryMovementRequestModel,InventoryMovementType} from '../../models/inventory.model';
import {InventoryService} from '../../../../services/InventoryService/inventory-service';
import {ErrorHandlerService} from '../../../../services/ErrorHandlerService/error-handler.service';

@Component({
  selector: 'app-inventory-movement-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './inventory-movement-modal.html',
  styleUrl: './inventory-movement-modal.scss',
})
export class InventoryMovementModal {

  @Input({ required: true }) item!: InventoryItemModel;

  @Output() close = new EventEmitter<boolean>();

  saving = false;
  errorMessage = '';

  form: {
    type: InventoryMovementType;
    quantity: number | null;
    reason: string;
    employeePin: string;
  } = {
    type: 'INGRESO',
    quantity: null,
    reason: '',
    employeePin: ''
  };

  constructor(
    private inventoryService: InventoryService,
    private errorHandler: ErrorHandlerService
  ) {}

  save(): void {
    this.errorMessage = '';

    if (!this.form.quantity || this.form.quantity < 1 ||
      !Number.isInteger(this.form.quantity)) {
      this.errorMessage = 'Ingresá una cantidad válida.';
      return;
    }

    if (
      this.form.type === 'EGRESO' &&
      this.form.quantity > this.item.quantity
    ) {
      this.errorMessage = 'No hay suficiente stock para realizar este egreso.';
      return;
    }

    if (!this.form.reason.trim()) {
      this.errorMessage = 'Ingresá el motivo del movimiento.';
      return;
    }

    if (!this.form.employeePin.trim()) {
      this.errorMessage = 'Ingresá tu PIN de empleado.';
      return;
    }

    const movement: InventoryMovementRequestModel = {
      itemId: this.item.id,
      type: this.form.type,
      quantity: this.form.quantity,
      reason: this.form.reason.trim(),
      employeePin: this.form.employeePin.trim()
    };

    this.saving = true;

    this.inventoryService.registerMovement(movement).subscribe({
      next: () => {
        this.saving = false;
        this.close.emit(true);
      },
      error: (error) => {
        this.saving = false;
        this.errorMessage = this.errorHandler.getMessage(error);
      }
    });
  }

  closeModal(): void {
    if (!this.saving) {
      this.close.emit(false);
    }
  }
}
