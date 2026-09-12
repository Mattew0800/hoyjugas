export interface SystemConfigModel {
  cancellationHoursLimit: number;
  reminderHoursBeforeBooking: number;
  termsAndConditions: string;
  recurringMonthsAhead: number;
  recurringInitialDepositTurns: number;
  recurringDepositMultiplier: number;
  maxRecurringCancellations: number;
}
