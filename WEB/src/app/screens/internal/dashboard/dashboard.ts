import { Component, OnInit } from '@angular/core';
import { InternalHeader } from '../components/internal-header/internal-header';
import { InternalSideBar } from '../components/internal-side-bar/internal-side-bar';
import {StatCard} from '../components/stat-card/stat-card';
import { SpaceColumn } from '../components/space-column/space-column';
import {SpaceModel} from '../models/space-column.model';
import { MiniCalendar } from '../components/mini-calendar/mini-calendar';
import {BookingService} from '../../../services/BookingService/booking-service';
import { BookingListModel } from '../models/booking-list.model';
import { SpaceSlotModel } from '../models/space-slot.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    InternalHeader,
    InternalSideBar,
    StatCard,
    SpaceColumn,
    MiniCalendar
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

  constructor(
    private bookingService: BookingService
  ) {
  }

  ngOnInit(): void {

    this.loadBookings();

  }

  private loadBookings(): void {

    this.bookingService.getBookings({

      dateFrom: this.formatDateStart(this.selectedDate),

      dateTo: this.formatDateEnd(this.selectedDate),

      page: 0,
      size: 20,
      sortBy: 'startDatetime',
      sortDirection: 'desc'

    }).subscribe({

      next: response => {

        console.log('BOOKINGS', response);

        if (response.content.length === 0) {

          this.spaces = [];
          return;

        }

        this.spaces = this.mapBookingsToSpaces(response.content);

        this.stats = this.buildStats(response.content);

        this.updateHeader(response.content);

      },

      error: error => {

        console.error(error);

      }

    });

  }

  private mapBookingsToSpaces(bookings: BookingListModel[]): SpaceModel[] {

    const spacesMap = new Map<string, SpaceModel>();

    let nextSpaceId = 1;
    let nextSlotId = 1;

    bookings.forEach(booking => {

      if (!spacesMap.has(booking.spaceName)) {

        spacesMap.set(booking.spaceName, {

          id: nextSpaceId++,

          name: booking.spaceName,

          type: '',

          slotDuration: 60,

          status: 'AVAILABLE',

          nextBookingTime: undefined,

          slots: []

        });

      }

      const space = spacesMap.get(booking.spaceName)!;

      const slot: SpaceSlotModel = {

        id: nextSlotId++,

        startTime: this.formatTime(booking.startDatetime),

        endTime: this.formatTime(booking.endDatetime),

        status: this.mapStatus(booking),

        clientName: booking.clientName,

        phone: booking.clientPhone

      };

      space.slots.push(slot);

    });

    return Array.from(spacesMap.values());

  }

  private formatTime(date: string): string {

    return new Date(date).toLocaleTimeString('es-AR', {

      hour: '2-digit',

      minute: '2-digit'

    });

  }

  private mapStatus(booking: BookingListModel): 'FREE' | 'PARTIAL' | 'PAID' {

    // Si la reserva fue cancelada, el horario vuelve a estar libre
    if (booking.status === 'CANCELADO') {
      return 'FREE';
    }

    // Reserva confirmada y totalmente paga
    if (booking.paymentStatus === 'PAGADO') {
      return 'PAID';
    }

    // Reserva existente con pago pendiente o parcial
    return 'PARTIAL';

  }
  private buildStats(bookings: BookingListModel[]) {

    const isToday =
      this.selectedDate.toDateString() === new Date().toDateString();

    let nextBooking: BookingListModel | undefined;
    let nextBookingSubtitle = '';

    if (isToday) {

      const now = new Date();

      nextBooking = bookings
        .filter(booking => new Date(booking.startDatetime) > now)
        .sort(
          (a, b) =>
            new Date(a.startDatetime).getTime() -
            new Date(b.startDatetime).getTime()
        )[0];

      if (nextBooking) {

        const diffMs =
          new Date(nextBooking.startDatetime).getTime() - now.getTime();

        const diffMinutes = Math.ceil(diffMs / 60000);

        if (diffMinutes < 60) {

          nextBookingSubtitle = `En ${diffMinutes} minutos`;

        } else {

          const hours = Math.floor(diffMinutes / 60);

          nextBookingSubtitle = `En ${hours} hora${hours > 1 ? 's' : ''}`;

        }

      }

    } else {

      nextBooking = bookings
        .sort(
          (a, b) =>
            new Date(a.startDatetime).getTime() -
            new Date(b.startDatetime).getTime()
        )[0];

      if (nextBooking) {
        nextBookingSubtitle = 'Primer turno del día';
      }

    }

    return {

      todayBookings: bookings.length,

      occupiedSpaces: new Set(
        bookings.map(booking => booking.spaceName)
      ).size,

      nextBookingTime: nextBooking
        ? this.formatTime(nextBooking.startDatetime)
        : '--:--',

      nextBookingSubtitle,

      estimatedRevenue: bookings.reduce(
        (total, booking) => total + booking.totalAmount,
        0
      )

    };

  }

  private updateHeader(bookings: BookingListModel[]): void {

    if (bookings.length === 0) {
      this.headerSubtitle = '';
      return;
    }

    const date = new Date(bookings[0].startDatetime);

    this.headerSubtitle = date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });

    this.headerSubtitle =
      this.headerSubtitle.charAt(0).toUpperCase() +
      this.headerSubtitle.slice(1);

  }

  onDateSelected(date: Date): void {

    this.selectedDate = date;

    console.log('Nueva fecha:', this.selectedDate);

    this.loadBookings();

  }

  private formatDateStart(date: Date): string {

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}T00:00:00`;

  }

  private formatDateEnd(date: Date): string {

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}T23:59:59`;

  }

  spaces: SpaceModel[] = [];

  stats = {
    todayBookings: 0,
    occupiedSpaces: 0,
    nextBookingTime: '--:--',
    nextBookingSubtitle: '',
    estimatedRevenue: 0
  };

  headerTitle = 'Turnos de hoy';

  headerSubtitle = '';

  selectedDate = new Date();
}



//   spaces: SpaceModel[] = [
//
//     {
//       id: 1,
//
//       name: 'Cancha 1',
//
//       type: 'Fútbol 5',
//
//       slotDuration: 60,
//       status:'AVAILABLE',
//
//       nextBookingTime:'09:00',
//
//       slots: [
//
//         {
//           id: 1,
//           startTime: '08:00',
//           endTime: '09:00',
//           status: 'PARTIAL',
//           clientName: 'Lucas Fernández',
//           phone: '2235123456'
//         },
//
//         {
//           id: 2,
//           startTime: '09:00',
//           endTime: '10:00',
//           status: 'FREE'
//         },
//
//         {
//           id: 3,
//           startTime: '10:00',
//           endTime: '11:00',
//           status: 'PAID',
//           clientName: 'Martín López',
//           phone: '2234987654'
//         }
//
//       ]
//
//     },
//
//     {
//       id: 2,
//
//       name: 'Cancha 2',
//
//       type: 'Fútbol 8',
//
//       slotDuration: 60,
//       status:'AVAILABLE',
//
//       nextBookingTime:'09:00',
//
//       slots: [
//
//         {
//           id: 4,
//           startTime: '08:00',
//           endTime: '09:00',
//           status: 'FREE'
//         },
//
//         {
//           id: 5,
//           startTime: '09:00',
//           endTime: '10:00',
//           status: 'PARTIAL',
//           clientName: 'Juan Pérez',
//           phone: '2234001122'
//         }
//
//       ]
//
//     }
//
//   ];
//
// }
