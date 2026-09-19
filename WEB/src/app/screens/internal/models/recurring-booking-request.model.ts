export interface RecurringBookingRequestModel {

  clientId: number;

  spaceId: number;

  startDate: string;

  startTime: string;

  intervalWeeks: number;

  endDate: string;

  termsAccepted: boolean;

  depositAmount: number | null;

  paymentMethod: string;

  transactionId: string | null;

  employeePin?: string;

}
