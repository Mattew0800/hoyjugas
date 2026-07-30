import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {InternalHeader} from '../../components/internal-header/internal-header';
import {InternalSideBar} from '../../components/internal-side-bar/internal-side-bar';
import {SpaceListItem} from '../../components/space-list-item/space-list-item';
import {SpaceListModel} from '../../models/space-list-model';

@Component({
  selector: 'app-spaces-screen',
  standalone: true,
  imports: [
    InternalHeader,
    InternalSideBar,
    FormsModule,
    SpaceListItem
  ],
  templateUrl: './spaces-screen.html',
  styleUrl: './spaces-screen.scss'
})
export class SpacesScreen {

  search = '';

  spaces: SpaceListModel[] = [
    {
      id: 1,
      name: 'Cancha 1',
      type: 'Fútbol 5',
      imageUrl: '/cancha1.png',
      slotDuration: 60,
      openingHour: '08:00',
      closingHour: '00:00',
      minimumPrice: 12000,
      active: true
    }
  ];

  newSpace(): void {

    console.log('Nuevo espacio');

  }

}
