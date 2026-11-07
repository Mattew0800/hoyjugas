export interface ProductRequestModel {
  internalCode: string;
  barcode?: string;
  name: string;
  cost: number;
  salePrice: number;
  minimumStock: number;
  categoryId: number;
  supplierId?: number;
}

export interface ProductUpdateRequestModel extends ProductRequestModel {
  id: number;
}

export interface ProductDetailModel {
  id: number;
  internalCode: string;
  barcode: string | null;
  name: string;
  cost: number;
  salePrice: number;
  profit: number;
  stock: number;
  minimumStock: number;
  lowStock: boolean;
  isActive: boolean;
  categoryName: string;
  supplierName: string | null;
  discount: number;
}

export interface ProductListModel {
  id: number;
  internalCode: string;
  barcode: string | null;
  name: string;
  salePrice: number;
  stock: number;
  lowStock: boolean;
  categoryName: string;
}

export interface ProductFilterModel {
  categoryId?: number;
  supplierId?: number;
  search?: string;
  lowStock?: boolean;
  isActive?: boolean;
  page: number;
  size: number;
  sortBy: string;
  sortDirection: string;
}

export interface ProductPageModel {
  content: ProductDetailModel[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
