export interface CategoryModel {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
}

export interface CategoryRequestModel {
  code: string;
  name: string;
}

export interface CategoryUpdateRequestModel extends CategoryRequestModel {
  id: number;
}
