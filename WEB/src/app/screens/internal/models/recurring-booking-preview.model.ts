export interface RecurringBookingPreviewModel {

  spaceId: number;

  spaceName: string;

  startDate: string;

  endDate: string;

  intervalWeeks: number;

  totalSlotsGenerated: number;

  conflictingSlots: number;

  conflicts: string[];

  available: string[];

  firstDepositAmount: number | null;

}
