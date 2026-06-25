import { Component, Input } from '@angular/core';
import { SpaceSlot} from '../space-slot/space-slot';
import {SpaceModel} from '../../models/space-column.model';

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

}
