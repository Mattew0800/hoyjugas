export interface BookingListModel {

  id: number;

  bookingNumber: string;

  clientName: string;

  clientPhone: string;

  spaceName: string;

  startDatetime: string;

  endDatetime: string;

  status: string;

  paymentStatus: string;

  totalAmount: number;

  remainingAmount?: number;

  paymentCollectedByName?: string;

}
