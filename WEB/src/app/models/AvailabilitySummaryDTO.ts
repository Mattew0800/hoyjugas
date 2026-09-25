import {DailyAvailabilityDTO} from './DailyAvailabilityDTO';

export interface AvailabilitySummaryDTO{
  days: DailyAvailabilityDTO[],
  totalAvailable: number
}
