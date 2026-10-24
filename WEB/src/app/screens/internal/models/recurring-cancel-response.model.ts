export interface RecurringCancelResponseModel {
  bookingId: number;
  fullCycleCancelled: boolean;
  currentCancellations: number;
  maxCancellations: number;
  message: string;
}
