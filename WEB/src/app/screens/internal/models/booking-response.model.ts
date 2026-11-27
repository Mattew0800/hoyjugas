export interface BookingResponseModel {
  id: number;
  bookingNumber: string;
  clientId: number;
  clientName: string;
  clientPhone: string;
  spaceId: number;
  spaceName: string;
  spaceType?: string;
  startDatetime: string;
  endDatetime: string;
  totalAmount: number;
  depositAmount: number;
  remainingAmount: number;
  paymentStatus: string;
  status: string;
  bookingStatus?: string;
  paymentCollectedByName?: string;
  observations?: string;
  recurring?: boolean;
}

export interface BookingWebCreatedResponseModel {
  booking: BookingResponseModel;
  mpUrl: string;
}

export interface PaymentStatusModel {
  paymentStatus: string;
}
