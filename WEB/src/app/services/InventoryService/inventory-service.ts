import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { getInventoryApiUrl } from '../../config/api.config';

import {
  InventoryItemModel,
  InventoryItemRequestModel,
  InventoryItemUpdateRequestModel,
  InventoryMovementRequestModel,
  InventoryMovementResponseModel
} from '../../screens/internal/models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  private readonly inventoryApiUrl = getInventoryApiUrl();

  constructor(
    private http: HttpClient
  ) {}

  createItem(
    item: InventoryItemRequestModel
  ): Observable<InventoryItemModel> {
    return this.http.post<InventoryItemModel>(
      `${this.inventoryApiUrl}/create-item`,
      item,
      { withCredentials: true }
    );
  }

  updateItem(
    item: InventoryItemUpdateRequestModel
  ): Observable<InventoryItemModel> {
    return this.http.post<InventoryItemModel>(
      `${this.inventoryApiUrl}/update`,
      item,
      { withCredentials: true }
    );
  }

  getAllItems(): Observable<InventoryItemModel[]> {
    return this.http.get<InventoryItemModel[]>(
      `${this.inventoryApiUrl}/list`,
      { withCredentials: true }
    );
  }

  toggleItemStatus(id: number): Observable<any> {
    return this.http.post(
      `${this.inventoryApiUrl}/toggle-status`,
      { id },
      { withCredentials: true }
    );
  }

  registerMovement(
    movement: InventoryMovementRequestModel
  ): Observable<InventoryMovementResponseModel> {
    return this.http.post<InventoryMovementResponseModel>(
      `${this.inventoryApiUrl}/movement/register`,
      movement,
      { withCredentials: true }
    );
  }

  getMovementsByItem(
    id: number
  ): Observable<InventoryMovementResponseModel[]> {
    return this.http.post<InventoryMovementResponseModel[]>(
      `${this.inventoryApiUrl}/movement/list`,
      { id },
      { withCredentials: true }
    );
  }
}
