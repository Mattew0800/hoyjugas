import {PaymentStatus} from './PaymentStatus';

export interface BookingListDTO {
  id: number;
  bookingNumber: string;
  clientName: string;
  clientPhone: string;
  spaceName: string;
  startDatetime: string; // LocalDateTime llega como string ISO
  endDatetime: string;
  status: string;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  remainingAmount: number;
  paymentCollectedByName: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
