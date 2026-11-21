
export type GoodsReceiptPaymentMethod =
  | 'EFECTIVO'
  | 'TRANSFERENCIA'
  | 'MERCADOPAGO'
  | 'DEBITO'
  | 'CREDITO'
  | 'INTERNO';

export interface GoodsReceiptItemRequest {
  productId: number;
  quantity: number;
  unitCost: number;
  discount?: number;
  newSalePrice?: number;
}

export interface GoodsReceiptRequest {
  supplierId: number;
  voucher?: string;
  paymentMethod: GoodsReceiptPaymentMethod;
  notes?: string;
  employeePin: string;
  items: GoodsReceiptItemRequest[];
}

export interface GoodsReceiptItemResponse {
  id: number;
  productName: string;
  productCode: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
  newSalePrice: number | null;
}

export interface GoodsReceiptResponse {
  id: number;
  movementNumber: string;
  date: string;
  supplierName: string;
  voucher: string;
  paymentMethod: string;
  totalAmount: number;
  registeredByName: string;
  notes: string;
  items: GoodsReceiptItemResponse[];
}
