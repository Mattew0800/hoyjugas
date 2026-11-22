
export type PaymentMethod =
  | 'EFECTIVO'
  | 'TRANSFERENCIA'
  | 'MERCADOPAGO'
  | 'DEBITO'
  | 'CREDITO'
  | 'INTERNO';

export interface SaleItemRequestModel {
  productId: number;
  quantity: number;
}

export interface SaleRequestModel {
  clientId?: number | null;
  paymentMethod: PaymentMethod;
  notes?: string;
  employeePin: string;
  items: SaleItemRequestModel[];
}

export interface SaleItemResponseModel {
  id: number;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleResponseModel {
  id: number;
  saleNumber: string;
  date: string;
  clientName: string;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  registeredByName: string;
  notes: string | null;
  items: SaleItemResponseModel[];
  stockAlerts?: string[];
}
