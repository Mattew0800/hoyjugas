export interface InventoryItemModel {
  id: number;
  name: string;
  quantity: number;
  minimumQuantity: number;
  lowStock: boolean;
  description: string | null;
  categoryName: string | null;
  isActive: boolean;
}

export interface InventoryItemRequestModel {
  name: string;
  minimumQuantity: number;
  description?: string;
  categoryId?: number | null;
}

export interface InventoryItemUpdateRequestModel
  extends InventoryItemRequestModel {
  id: number;
}

export type InventoryMovementType = 'INGRESO' | 'EGRESO' | 'AJUSTE';

export interface InventoryMovementRequestModel {
  itemId: number;
  type: InventoryMovementType;
  quantity: number;
  reason: string;
  employeePin: string;
}

export interface InventoryMovementResponseModel {
  id: number;
  movementNumber: string;
  itemName: string;
  type: InventoryMovementType;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  reason: string;
  registeredByName: string;
  createdAt: string;
}
