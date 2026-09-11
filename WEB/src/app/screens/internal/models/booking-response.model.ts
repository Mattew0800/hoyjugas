export interface BookingResponseModel {

  id: number;

  bookingNumber: string;

  clientId: number;

  clientName: string;

  clientPhone: string;

  spaceId: number;

  spaceName: string;

  spaceType: string;

  photoUrl: string;

  startDatetime: string;

  endDatetime: string;

  status: string;

  paymentStatus: string;

  totalAmount: number;

  depositAmount: number;

  remainingAmount: number;

  depositLabel: string;

  cancelledAt: string | null;

  cancellationReason: string | null;

  refunded: boolean | null;

  createdByName: string | null;

  paymentCollectedByName: string | null;

  createdAt: string;

  termsAccepted: boolean;

}
