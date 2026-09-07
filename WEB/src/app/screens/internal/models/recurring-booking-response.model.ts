import { RecurringBookingSlotModel }
  from './recurring-booking-slot.model';

export interface RecurringBookingResponseModel {

  id: number;

  clientId: number;

  clientName: string;

  clientPhone: string;

  spaceId: number;

  spaceName: string;

  spaceType: string;

  dayOfWeek: string;

  startTime: string;

  startDate: string;

  endDate: string;

  intervalWeeks: number;

  status: string;

  cancellationCount: number;

  isRecurring: boolean;

  recurringLabel: string;

  depositLabel: string;

  generatedTotalBookings: number;

  pendingBookings: number;

  cancelledBookings: number;

  firstBookingPaymentStatus: string;

  firstBookingDepositAmount: number;

  slots: RecurringBookingSlotModel[];

}
