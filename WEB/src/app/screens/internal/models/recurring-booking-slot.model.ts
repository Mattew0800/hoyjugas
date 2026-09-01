export interface RecurringBookingSlotModel {

  bookingId: number;

  bookingNumber: string;

  startDatetime: string;

  endDatetime: string;

  bookingStatus: string;

  paymentStatus: string;

  totalAmount: number;

  depositAmount: number;

  remainingAmount: number;

  isInitialDeposit: boolean;

}
