export interface BookingFilterModel {

  clientId?: number;

  spaceId?: number;

  status?: string;

  employeeId?: number;

  dateFrom?: string;

  dateTo?: string;

  page: number;

  size: number;

  sortBy: string;

  sortDirection: string;

}
