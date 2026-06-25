import { Component } from '@angular/core';
import { InternalHeader } from '../components/internal-header/internal-header';
import { InternalSideBar } from '../components/internal-side-bar/internal-side-bar';
import {StatCard} from '../components/stat-card/stat-card';
import { SpaceColumn } from '../components/space-column/space-column';
import {SpaceModel} from '../models/space-column.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    InternalHeader,
    InternalSideBar,
    StatCard,
    SpaceColumn
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

  spaces: SpaceModel[] = [

    {
      id: 1,

      name: 'Cancha 1',

      type: 'Fútbol 5',

      slotDuration: 60,
      status:'AVAILABLE',

      nextBookingTime:'09:00',

      slots: [

        {
          id: 1,
          startTime: '08:00',
          endTime: '09:00',
          status: 'PARTIAL',
          clientName: 'Lucas Fernández',
          phone: '2235123456'
        },

        {
          id: 2,
          startTime: '09:00',
          endTime: '10:00',
          status: 'FREE'
        },

        {
          id: 3,
          startTime: '10:00',
          endTime: '11:00',
          status: 'PAID',
          clientName: 'Martín López',
          phone: '2234987654'
        }

      ]

    },

    {
      id: 2,

      name: 'Cancha 2',

      type: 'Fútbol 8',

      slotDuration: 60,
      status:'AVAILABLE',

      nextBookingTime:'09:00',

      slots: [

        {
          id: 4,
          startTime: '08:00',
          endTime: '09:00',
          status: 'FREE'
        },

        {
          id: 5,
          startTime: '09:00',
          endTime: '10:00',
          status: 'PARTIAL',
          clientName: 'Juan Pérez',
          phone: '2234001122'
        }

      ]

    }

  ];

}
