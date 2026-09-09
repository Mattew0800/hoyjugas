import {BookingListModel} from './booking-list.model';

export interface SpaceSlotModel {

  id: number;

  startTime: string;

  endTime: string;

  status: 'FREE' | 'PARTIAL' | 'PAID';

  clientName?: string;

  phone?: string;

  booking?: BookingListModel;

}
