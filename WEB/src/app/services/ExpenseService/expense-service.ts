
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { getExpenseApiUrl } from '../../config/api.config';

import {
  ExpenseConceptModel,
  ExpenseConceptRequestModel,
  ExpenseFilterModel,
  ExpenseModel,
  ExpensePageModel,
  ExpenseRequestModel
} from '../../screens/internal/models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private readonly expenseApiUrl = getExpenseApiUrl();

  constructor(private http: HttpClient) {}

  createExpense(
    expense: ExpenseRequestModel
  ): Observable<ExpenseModel> {
    return this.http.post<ExpenseModel>(
      `${this.expenseApiUrl}/create`,
      expense,
      { withCredentials: true }
    );
  }

  getExpense(id: number): Observable<ExpenseModel> {
    return this.http.post<ExpenseModel>(
      `${this.expenseApiUrl}/get`,
      { id },
      { withCredentials: true }
    );
  }

  getAllExpenses(
    filters: ExpenseFilterModel
  ): Observable<ExpensePageModel> {
    return this.http.post<ExpensePageModel>(
      `${this.expenseApiUrl}/list`,
      filters,
      { withCredentials: true }
    );
  }

  getAllConcepts(): Observable<ExpenseConceptModel[]> {
    return this.http.get<ExpenseConceptModel[]>(
      `${this.expenseApiUrl}/concept/list`,
      { withCredentials: true }
    );
  }

  getActiveConcepts(): Observable<ExpenseConceptModel[]> {
    return this.http.get<ExpenseConceptModel[]>(
      `${this.expenseApiUrl}/concept/list-active`,
      { withCredentials: true }
    );
  }

  createConcept(
    concept: ExpenseConceptRequestModel
  ): Observable<ExpenseConceptModel> {
    return this.http.post<ExpenseConceptModel>(
      `${this.expenseApiUrl}/concept/create`,
      concept,
      { withCredentials: true }
    );
  }

  toggleConceptStatus(id: number): Observable<any> {
    return this.http.post(
      `${this.expenseApiUrl}/concept/toggle-status`,
      { id },
      { withCredentials: true }
    );
  }
}
