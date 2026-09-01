export interface InternalBookingRequestModel {

  clientId: number;

  spaceId: number;

  startDatetime: string;

  paymentMethod: string;

  depositAmount: number | null;

  transactionId: string | null;

  employeePin: string;

  termsAccepted: boolean;

}
