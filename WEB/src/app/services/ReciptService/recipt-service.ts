import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {

  private readonly receiptApiUrl =
    `http://${window.location.hostname}:8080/hoyjugas/tickets`;

  constructor(private http: HttpClient) {}

  getBookingReceipt(bookingId: number): Observable<Blob> {
    return this.http.post(
      `${this.receiptApiUrl}/booking`,
      { id: bookingId },
      { responseType: 'blob', withCredentials: true }
    );
  }

  getPaymentReceipt(bookingId: number): Observable<Blob> {
    return this.http.post(
      `${this.receiptApiUrl}/booking/payment-receipt`,
      { id: bookingId },
      { responseType: 'blob', withCredentials: true }
    );
  }
}
