
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { getGoodsReceiptApiUrl } from '../../config/api.config';
import {GoodsReceiptRequest,GoodsReceiptResponse} from '../../screens/internal/models/goods-recipt.model';

@Injectable({
  providedIn: 'root'
})
export class GoodsReceiptService {

  private readonly apiUrl = getGoodsReceiptApiUrl();

  constructor(private http: HttpClient) {}

  create(
    request: GoodsReceiptRequest
  ): Observable<GoodsReceiptResponse> {
    return this.http.post<GoodsReceiptResponse>(
      `${this.apiUrl}/create`,
      request,
      { withCredentials: true }
    );
  }
}
