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

  @Input({ required: true })
  timelineStartMinutes!: number;

  @Input({ required: true })
  timelineEndMinutes!: number;

  @Input()
  pixelsPerHalfHour = 61;

  @Output()
  slotClick = new EventEmitter<SpaceSlotModel>();

  get timelineHeight(): number {

    const totalMinutes =
      this.timelineEndMinutes -
      this.timelineStartMinutes;

    return (
      totalMinutes / 30
    ) * this.pixelsPerHalfHour;

  }

  getSlotTop(slot: SpaceSlotModel): number {

    const startMinutes =
      this.timeToMinutes(slot.startTime);

    const minutesFromStart =
      startMinutes -
      this.timelineStartMinutes;

    return (
      minutesFromStart / 30
    ) * this.pixelsPerHalfHour;

  }

  getSlotHeight(slot: SpaceSlotModel): number {

    const startMinutes =
      this.timeToMinutes(slot.startTime);

    const endMinutes =
      this.timeToMinutes(slot.endTime);

    const duration =
      endMinutes -
      startMinutes;

    const calculatedHeight =
      (duration / 30) *
      this.pixelsPerHalfHour;

    return Math.max(
      110,
      calculatedHeight - 12
    );

  }

  private timeToMinutes(time: string): number {

    const [hours, minutes] =
      time.split(':').map(Number);

    return (
      hours * 60 +
      minutes
    );

  }

  onSlotClick(slot: SpaceSlotModel): void {

    this.slotClick.emit(slot);

  }

}
