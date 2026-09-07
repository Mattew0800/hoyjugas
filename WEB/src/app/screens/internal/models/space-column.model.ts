import {SpaceSlotModel} from './space-slot.model';

export interface SpaceModel {

  id: number;

  name: string;

  type: string;

  slotDuration: number;

  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';

  nextBookingTime?: string;

  slots: SpaceSlotModel[];

}
