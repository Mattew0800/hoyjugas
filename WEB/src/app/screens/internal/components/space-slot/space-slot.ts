import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SpaceSlotModel } from '../../models/space-slot.model';

@Component({
  selector: 'app-space-slot',
  standalone: true,
  imports: [],
  templateUrl: './space-slot.html',
  styleUrl: './space-slot.scss'
})
export class SpaceSlot {

  @Input({ required: true })
  slot!: SpaceSlotModel;

  @Output()
  slotClick = new EventEmitter<SpaceSlotModel>();

  get statusLabel(): string {

    switch (this.slot.status) {

      case 'FREE':
        return '';

      case 'PARTIAL':
        return 'Seña';

      case 'PAID':
        return 'Pago completo';

      default:
        return '';

    }

  }

  onSlotClick(): void {

    if (this.slot.status === 'FREE') {
      return;
    }

    this.slotClick.emit(this.slot);

  }

}
