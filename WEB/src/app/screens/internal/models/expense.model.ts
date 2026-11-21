
export type PaymentMethod =
  | 'EFECTIVO'
  | 'TRANSFERENCIA'
  | 'MERCADOPAGO'
  | 'DEBITO'
  | 'CREDITO'
  | 'INTERNO';

export interface ExpenseConceptModel {
  id: number;
  name: string;
  isExtra: boolean;
  isActive: boolean;
}

export interface ExpenseModel {
  id: number;
  movementNumber: string;
  date: string;
  conceptName: string;
  voucher: string | null;
  amount: number;
  detail: string;
  supplierName: string | null;
  registeredByName: string;
  paymentMethod: PaymentMethod;
}

export interface ExpenseRequestModel {
  conceptId: number;
  voucher?: string;
  amount: number;
  detail: string;
  supplierId?: number | null;
  paymentMethod: PaymentMethod;
  employeePin: string;
}

export interface ExpenseConceptRequestModel {
  name: string;
  isExtra: boolean;
}

export interface ExpenseFilterModel {
  conceptId?: number | null;
  supplierId?: number | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  page: number;
  size: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

export interface ExpensePageModel {
  content: ExpenseModel[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
