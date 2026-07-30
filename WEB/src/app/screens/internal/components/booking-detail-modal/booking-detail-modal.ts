import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BookingListModel } from '../../models/booking-list.model';

import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-booking-detail-modal',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './booking-detail-modal.html',
  styleUrl: './booking-detail-modal.scss'
})
export class BookingDetailModal {

  @Input({ required: true })
  booking!: BookingListModel;

  @Output()
  close = new EventEmitter<void>();

  @Output()
  confirmPayment = new EventEmitter<BookingListModel>();

  get durationMinutes(): number {

    const start = new Date(this.booking.startDatetime);
    const end = new Date(this.booking.endDatetime);

    return Math.round((end.getTime() - start.getTime()) / 60000);

  }

  closeModal(): void {
    this.close.emit();
  }

  onConfirmPayment(): void {
    this.confirmPayment.emit(this.booking);
  }

}
