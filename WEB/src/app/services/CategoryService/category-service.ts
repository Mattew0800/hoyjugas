import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { getCategoryApiUrl } from '../../config/api.config';

import {
  CategoryModel,
  CategoryRequestModel,
  CategoryUpdateRequestModel
} from '../../screens/internal/models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private readonly categoryApiUrl = getCategoryApiUrl();

  constructor(
    private http: HttpClient
  ) {}

  createCategory(
    category: CategoryRequestModel
  ): Observable<CategoryModel> {
    return this.http.post<CategoryModel>(
      `${this.categoryApiUrl}/create`,
      category,
      { withCredentials: true }
    );
  }

  updateCategory(
    category: CategoryUpdateRequestModel
  ): Observable<CategoryModel> {
    return this.http.post<CategoryModel>(
      `${this.categoryApiUrl}/update`,
      category,
      { withCredentials: true }
    );
  }

  toggleCategoryStatus(id: number): Observable<any> {
    return this.http.post(
      `${this.categoryApiUrl}/toggle-status`,
      { id },
      { withCredentials: true }
    );
  }

  getAllCategories(): Observable<CategoryModel[]> {
    return this.http.get<CategoryModel[]>(
      `${this.categoryApiUrl}/get-all`,
      { withCredentials: true }
    );
  }

  getActiveCategories(): Observable<CategoryModel[]> {
    return this.http.get<CategoryModel[]>(
      `${this.categoryApiUrl}/get-active`,
      { withCredentials: true }
    );
  }

  getCategory(id: number): Observable<CategoryModel> {
    return this.http.request<CategoryModel>(
      'GET',
      `${this.categoryApiUrl}/get`,
      {
        body: { id },
        withCredentials: true
      }
    );
  }
}
