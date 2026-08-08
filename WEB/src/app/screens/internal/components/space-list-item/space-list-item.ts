import { Component, Input } from '@angular/core';
import { SpaceListModel} from '../../models/space-list-model';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-space-list-item',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './space-list-item.html',
  styleUrl: './space-list-item.scss'
})
export class SpaceListItem {

  @Input({ required: true })
  space!: SpaceListModel;

}
