import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { getProductApiUrl } from '../../config/api.config';

import {
  ProductRequestModel,
  ProductUpdateRequestModel,
  ProductDetailModel,
  ProductListModel,
  ProductFilterModel,
  ProductPageModel
} from '../../screens/internal/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly productApiUrl = getProductApiUrl();

  constructor(
    private http: HttpClient
  ) {}

  // Listado administrativo con filtros y paginación
  getAllProducts(
    filter: ProductFilterModel
  ): Observable<ProductPageModel> {
    return this.http.post<ProductPageModel>(
      `${this.productApiUrl}/list`,
      filter,
      { withCredentials: true }
    );
  }

  // Obtener detalle de un producto
  getProduct(id: number): Observable<ProductDetailModel> {
    return this.http.post<ProductDetailModel>(
      `${this.productApiUrl}/get`,
      { id },
      { withCredentials: true }
    );
  }

  // Crear producto
  createProduct(
    product: ProductRequestModel
  ): Observable<ProductDetailModel> {
    return this.http.post<ProductDetailModel>(
      `${this.productApiUrl}/create`,
      product,
      { withCredentials: true }
    );
  }

  // Actualizar producto
  updateProduct(
    product: ProductUpdateRequestModel
  ): Observable<ProductDetailModel> {
    return this.http.post<ProductDetailModel>(
      `${this.productApiUrl}/update`,
      product,
      { withCredentials: true }
    );
  }

  // Buscar productos por código, nombre o código de barras
  searchProducts(query: string): Observable<ProductListModel[]> {
    return this.http.post<ProductListModel[]>(
      `${this.productApiUrl}/search`,
      { query },
      { withCredentials: true }
    );
  }

  // Buscar producto por código de barras
  getProductByBarcode(
    barcode: string
  ): Observable<ProductListModel> {
    return this.http.post<ProductListModel>(
      `${this.productApiUrl}/barcode`,
      { barcode },
      { withCredentials: true }
    );
  }

  // Activar o desactivar producto
  toggleProductStatus(id: number): Observable<any> {
    return this.http.post(
      `${this.productApiUrl}/toggle-status`,
      { id },
      { withCredentials: true }
    );
  }
}
