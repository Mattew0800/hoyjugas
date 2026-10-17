import {Component, EventEmitter, Input, Output} from '@angular/core';
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

  @Output()
  edit = new EventEmitter<number>();

  @Output()
  toggleStatus = new EventEmitter<{ spaceId: number; isActive: boolean }>();

  editSpace(): void {

    this.edit.emit(this.space.id);
  }

  toggleSpaceStatus(): void {
    this.toggleStatus.emit({
      spaceId: this.space.id,
      isActive: !this.space.isActive
    });
  }
}
