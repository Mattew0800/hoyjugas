
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { getSaleApiUrl } from '../../config/api.config';
import {SaleRequestModel,SaleResponseModel} from '../../screens/internal/models/sale.mode';

@Injectable({
  providedIn: 'root'
})
export class SaleService {

  private readonly saleApiUrl = getSaleApiUrl();

  constructor(private http: HttpClient) {}

  createSale(sale: SaleRequestModel): Observable<SaleResponseModel> {
    return this.http.post<SaleResponseModel>(
      `${this.saleApiUrl}/create`,
      sale,
      { withCredentials: true }
    );
  }

  getSale(id: number): Observable<SaleResponseModel> {
    return this.http.post<SaleResponseModel>(
      `${this.saleApiUrl}/get`,
      { id },
      { withCredentials: true }
    );
  }
}
