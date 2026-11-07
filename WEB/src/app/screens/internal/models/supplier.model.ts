export interface SupplierModel {
  id: number;
  supplierNumber: string;
  name: string;
  phone: string;
  cuit: string;
  categoryName: string;
  isActive: boolean;
}

export interface SupplierDetailModel extends SupplierModel {
  whatsappUrl: string;
  bank: string | null;
  accountNumber: string | null;
  accountType: string | null;
  paymentTermDays: number | null;
}

export interface SupplierRequestModel {
  supplierNumber: string;
  name: string;
  phone: string;
  cuit: string;
  categoryId: number;
  bank?: string;
  accountNumber?: string;
  accountType?: string;
  paymentTermDays?: number;
}

export interface SupplierUpdateRequestModel extends SupplierRequestModel {
  id: number;
}
