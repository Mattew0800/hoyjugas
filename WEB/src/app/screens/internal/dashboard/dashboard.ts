import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';

import { InternalHeader } from '../components/internal-header/internal-header';
import { InternalSideBar } from '../components/internal-side-bar/internal-side-bar';
import { StatCard } from '../components/stat-card/stat-card';
import { SpaceColumn } from '../components/space-column/space-column';
import { MiniCalendar } from '../components/mini-calendar/mini-calendar';

import { SpaceModel } from '../models/space-column.model';
import { BookingListModel } from '../models/booking-list.model';
import { SpaceSlotModel } from '../models/space-slot.model';
import { SpaceCardModel } from '../models/space-card.model';

import { BookingService } from '../../../services/BookingService/booking-service';
import { SpaceService } from '../../../services/SpaceService/SpaceService';
import { BookingDetailModal } from '../components/booking-detail-modal/booking-detail-modal';
import { InternalBookingModal } from '../components/internal-booking-modal/internal-booking-modal';
import { RoleService } from '../../../services/RoleService/role-service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    InternalHeader,
    InternalSideBar,
    StatCard,
    SpaceColumn,
    MiniCalendar,
    BookingDetailModal,
    InternalBookingModal
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

  spaces: SpaceModel[] = [];

  stats = {
    todayBookings: 0,
    occupiedSpaces: 0,
    nextBookingTime: '--:--',
    nextBookingSubtitle: '',
    estimatedRevenue: 0
  };

  headerTitle = 'Turnos del día';

  headerSubtitle = '';

  selectedDate = new Date();

  showBookingModal = false;

  showInternalBookingModal = false;

  selectedBooking?: BookingListModel;

  constructor(
    private bookingService: BookingService,
    private spaceService: SpaceService,
    public roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  private loadBookings(): void {

    const date = this.formatLocalDate(this.selectedDate);

    forkJoin({
      spaces: this.spaceService.getSpaceCards(),

      bookings: this.bookingService.getBookings({
        dateFrom: `${date}T00:00:00`,
        dateTo: `${date}T23:59:59`,
        page: 0,
        size: 100,
        sortBy: 'startDatetime',
        sortDirection: 'asc'
      })
    }).subscribe({

      next: ({ spaces, bookings }) => {


        const availabilityRequests = spaces.map(space =>
          this.bookingService.getAvailability(
            space.id,
            date
          )
        );

        if (availabilityRequests.length === 0) {

          this.spaces = [];

          this.stats = this.buildStats(bookings.content);

          this.updateHeader(bookings.content);

          return;
        }

        forkJoin(availabilityRequests).subscribe({

          next: availabilityResponses => {

            this.spaces = this.mapSpaces(
              spaces,
              bookings.content,
              availabilityResponses
            );

            this.stats = this.buildStats(bookings.content);

            this.updateHeader(bookings.content);

          },

          error: error => {

            console.error(
              'ERROR AL CARGAR DISPONIBILIDAD:',
              error
            );

            this.spaces = this.mapSpaces(
              spaces,
              bookings.content,
              []
            );

            this.stats = this.buildStats(bookings.content);

            this.updateHeader(bookings.content);

          }

        });

      },

      error: error => {

        console.error(
          'ERROR AL CARGAR DASHBOARD:',
          error
        );

      }

    });

  }

  private mapSpaces(
    spaces: SpaceCardModel[],
    bookings: BookingListModel[],
    availabilityResponses: any[]
  ): SpaceModel[] {

    return spaces.map((space, index) => {

      const spaceBookings = bookings
        .filter(
          booking =>
            booking.spaceName === space.name
        )
        .sort(
          (a, b) =>
            new Date(a.startDatetime).getTime() -
            new Date(b.startDatetime).getTime()
        );

      const availability =
        availabilityResponses[index] ?? [];

      const availabilityList =
        Array.isArray(availability)
          ? availability
          : availability?.slots ?? [];

      const slots: SpaceSlotModel[] =
        availabilityList.map(
          (availableSlot: any) => {

            const startDatetime =
              availableSlot.startDatetime ??
              availableSlot.startTime;

            const endDatetime =
              availableSlot.endDatetime ??
              availableSlot.endTime;

            const booking =
              spaceBookings.find(
                existingBooking =>
                  this.sameTime(
                    existingBooking.startDatetime,
                    startDatetime
                  ) &&
                  this.sameTime(
                    existingBooking.endDatetime,
                    endDatetime
                  )
              );

            if (booking) {

              return {
                id: booking.id,
                startTime: this.formatTime(
                  booking.startDatetime
                ),
                endTime: this.formatTime(
                  booking.endDatetime
                ),
                status: this.mapStatus(booking),
                clientName: booking.clientName,
                phone: booking.clientPhone,
                booking
              };

            }

            return {
              id: this.createSlotId(
                space.id,
                startDatetime
              ),
              startTime: this.formatAvailabilityTime(
                startDatetime
              ),
              endTime: this.formatAvailabilityTime(
                endDatetime
              ),
              status: 'FREE',
              booking: undefined
            };

          }
        );

      return {
        id: space.id,
        name: space.name,
        type: space.type,
        slotDuration: space.slotDuration,

        status: space.isActive
          ? 'AVAILABLE'
          : 'MAINTENANCE',

        nextBookingTime:
          slots.length > 0
            ? slots.find(
              slot =>
                slot.status !== 'FREE'
            )?.startTime
            : undefined,

        slots
      };

    });

  }

  private sameTime(
    first: string,
    second: string
  ): boolean {

    const firstDate = new Date(first);
    const secondDate = new Date(second);

    return (
      firstDate.getTime() ===
      secondDate.getTime()
    );

  }

  private createSlotId(
    spaceId: number,
    start: string
  ): number {

    const timestamp =
      new Date(start).getTime();

    return Math.abs(
      spaceId * 1000000000 + timestamp
    );

  }

  private formatAvailabilityTime(
    value: string
  ): string {

    if (!value) {
      return '--:--';
    }

    if (
      /^\d{2}:\d{2}/.test(value)
    ) {
      return value.substring(0, 5);
    }

    return this.formatTime(value);

  }

  private formatTime(
    date: string
  ): string {

    return new Date(date).toLocaleTimeString(
      'es-AR',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }
    );

  }

  private mapStatus(
    booking: BookingListModel
  ): 'FREE' | 'PARTIAL' | 'PAID' {

    if (
      booking.status === 'CANCELADO'
    ) {
      return 'FREE';
    }

    if (
      booking.paymentStatus === 'PAGADO'
    ) {
      return 'PAID';
    }

    return 'PARTIAL';

  }

  private buildStats(
    bookings: BookingListModel[]
  ) {

    if (bookings.length === 0) {

      return {
        todayBookings: 0,
        occupiedSpaces: 0,
        nextBookingTime: '--:--',
        nextBookingSubtitle: '',
        estimatedRevenue: 0
      };

    }

    const isToday =
      this.formatLocalDate(
        this.selectedDate
      ) ===
      this.formatLocalDate(
        new Date()
      );

    let nextBooking:
      BookingListModel | undefined;

    let nextBookingSubtitle = '';

    if (isToday) {

      const now = new Date();

      nextBooking = bookings
        .filter(
          booking =>
            new Date(
              booking.startDatetime
            ) > now &&
            booking.status !== 'CANCELADO'
        )
        .sort(
          (a, b) =>
            new Date(a.startDatetime).getTime() -
            new Date(b.startDatetime).getTime()
        )[0];

      if (nextBooking) {

        const diffMs =
          new Date(
            nextBooking.startDatetime
          ).getTime() -
          now.getTime();

        const diffMinutes =
          Math.ceil(
            diffMs / 60000
          );

        if (diffMinutes < 60) {

          nextBookingSubtitle =
            `En ${diffMinutes} minutos`;

        } else {

          const hours =
            Math.floor(
              diffMinutes / 60
            );

          nextBookingSubtitle =
            `En ${hours} hora${hours > 1 ? 's' : ''}`;

        }

      }

    } else {

      nextBooking = bookings
        .filter(
          booking =>
            booking.status !== 'CANCELADO'
        )
        .sort(
          (a, b) =>
            new Date(a.startDatetime).getTime() -
            new Date(b.startDatetime).getTime()
        )[0];

      if (nextBooking) {

        nextBookingSubtitle =
          'Primer turno del día';

      }

    }

    return {

      todayBookings: bookings.filter(
        booking =>
          booking.status !== 'CANCELADO'
      ).length,

      occupiedSpaces: new Set(
        bookings
          .filter(
            booking =>
              booking.status !== 'CANCELADO'
          )
          .map(
            booking =>
              booking.spaceName
          )
      ).size,

      nextBookingTime: nextBooking
        ? this.formatTime(
          nextBooking.startDatetime
        )
        : '--:--',

      nextBookingSubtitle,

      estimatedRevenue:
        bookings
          .filter(
            booking =>
              booking.status !== 'CANCELADO'
          )
          .reduce(
            (total, booking) =>
              total +
              booking.totalAmount,
            0
          )

    };

  }

  private updateHeader(
    bookings: BookingListModel[]
  ): void {

    const date =
      this.selectedDate;

    this.headerSubtitle =
      date.toLocaleDateString(
        'es-AR',
        {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        }
      );

    this.headerSubtitle =
      this.headerSubtitle
        .charAt(0)
        .toUpperCase() +
      this.headerSubtitle.slice(1);

  }

  onDateSelected(
    date: Date
  ): void {

    this.selectedDate =
      date;

    this.loadBookings();

  }

  private formatLocalDate(
    date: Date
  ): string {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        date.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;

  }

  openBookingModal(
    slot: SpaceSlotModel
  ): void {

    if (!slot.booking) {
      return;
    }

    this.selectedBooking =
      slot.booking;

    this.showBookingModal =
      true;

  }

  openInternalBookingModal(
    slot?: SpaceSlotModel
  ): void {

    if (slot?.booking) {

      this.selectedBooking =
        slot.booking;

    }

    this.showInternalBookingModal =
      true;

  }

  closeBookingModal(): void {

    this.showBookingModal =
      false;

    this.selectedBooking =
      undefined;

  }

  closeInternalBookingModal(): void {

    this.showInternalBookingModal =
      false;

  }

  onBookingCreated(): void {

    this.showInternalBookingModal =
      false;

    this.loadBookings();

  }

  onBookingCanceled(): void {

    this.showBookingModal =
      false;

    this.selectedBooking =
      undefined;

    this.loadBookings();

  }

  confirmPayment(
    booking: BookingListModel
  ): void {

    console.log(
      'Pago confirmado',
      booking
    );

    this.closeBookingModal();

  }

}
