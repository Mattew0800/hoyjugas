import { Component, Input } from '@angular/core';
import {SpaceSlotModel} from '../../models/space-slot.model';


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

}
