import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SpaceSlot } from '../space-slot/space-slot';
import { SpaceModel } from '../../models/space-column.model';
import { SpaceSlotModel } from '../../models/space-slot.model';

@Component({
  selector: 'app-space-column',
  standalone: true,
  imports: [
    SpaceSlot
  ],
  templateUrl: './space-column.html',
  styleUrl: './space-column.scss'
})
export class SpaceColumn {

  @Input({ required: true })
  space!: SpaceModel;

  @Output()
  slotClick = new EventEmitter<SpaceSlotModel>();

  onSlotClick(slot: SpaceSlotModel): void {
    this.slotClick.emit(slot);
  }

}
