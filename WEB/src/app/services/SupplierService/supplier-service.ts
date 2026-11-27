import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { getSupplierApiUrl } from '../../config/api.config';

import {
  SupplierModel,
  SupplierDetailModel,
  SupplierRequestModel,
  SupplierUpdateRequestModel
} from '../../screens/internal/models/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  private readonly supplierApiUrl = getSupplierApiUrl();

  constructor(
    private http: HttpClient
  ) {}

  createSupplier(
    supplier: SupplierRequestModel
  ): Observable<SupplierDetailModel> {
    return this.http.post<SupplierDetailModel>(
      `${this.supplierApiUrl}/create`,
      supplier,
      { withCredentials: true }
    );
  }

  updateSupplier(
    supplier: SupplierUpdateRequestModel
  ): Observable<SupplierDetailModel> {
    return this.http.post<SupplierDetailModel>(
      `${this.supplierApiUrl}/update`,
      supplier,
      { withCredentials: true }
    );
  }

  toggleSupplierStatus(id: number): Observable<any> {
    return this.http.post(
      `${this.supplierApiUrl}/toggle-status`,
      { id },
      { withCredentials: true }
    );
  }

  getAllSuppliers(): Observable<SupplierModel[]> {
    return this.http.get<SupplierModel[]>(
      `${this.supplierApiUrl}/list`,
      { withCredentials: true }
    );
  }

  getActiveSuppliers(): Observable<SupplierModel[]> {
    return this.http.get<SupplierModel[]>(
      `${this.supplierApiUrl}/list-active`,
      { withCredentials: true }
    );
  }

  getSupplier(id: number): Observable<SupplierDetailModel> {
    return this.http.post<SupplierDetailModel>(
      `${this.supplierApiUrl}/get`,
      { id },
      { withCredentials: true }
    );
  }
}
