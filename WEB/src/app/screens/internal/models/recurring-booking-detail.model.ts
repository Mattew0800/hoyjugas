export interface RecurringBookingDetailModel {
  recurringBookingId: number;
  clientName: string;
  clientEmail: string;
  spaceName: string;
  spaceType: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  intervalWeeks: number;
  cancellationCount: number;
  status: string;
  cancelledByName?: string;
  cancelledAt?: string;
}
