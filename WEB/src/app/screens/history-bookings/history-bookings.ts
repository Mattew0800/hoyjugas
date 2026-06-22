import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../header/header';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';

@Component({
  selector: 'app-history-bookings',
  standalone: true,
  imports: [
    CommonModule,
    Header,
    BottomNavbar
  ],
  templateUrl: './history-bookings.html',
  styleUrl: './history-bookings.scss'
})
export class HistoryBookings {

  activeTab: 'upcoming' | 'past' = 'upcoming';

  bookings = [
    {
      field: 'Cancha 1 — Fútbol 5',
      dateMonth: 'SEP',
      dateDay: '15',
      time: '13:00 a 14:00 hs',
      status: 'deposit',
      statusText: 'SEÑADO ($4.000)',
      type: 'Techada',
      extra: 'Restan abonar: $4.000',
      reference: 'AZ-9821'
    },
    {
      field: 'Cancha 3 — Fútbol 5',
      dateMonth: 'SEP',
      dateDay: '22',
      time: '19:00 a 20:00 hs',
      status: 'paid',
      statusText: 'TOTAL PAGADO',
      type: 'Descubierta',
      extra: '¡Listo para jugar!',
      reference: 'AZ-9954'
    }
  ];

  selectTab(tab: 'upcoming' | 'past'): void {
    this.activeTab = tab;
  }

  viewDetails(reference: string): void {
    console.log(reference);
  }
}
