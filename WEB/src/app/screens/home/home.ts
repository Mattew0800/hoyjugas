import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { BottomNavbar } from '../bottom-navbar/bottom-navbar';
import { Header } from '../header/header';
import { Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { BookingService } from '../../services/BookingService/booking-service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, BottomNavbar, Header],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit, OnDestroy {

  availableTurns: number = 3;

  closingTime: string = "";
  openingTime: string = "";

  noSchedules = false;

  closedNow: boolean = false;
  scheduleError: boolean = false;
  avaliableSlotsToday: number = 0;

  dayType: string = "";

  // La card se alimenta de estos dos. `nextBookingDate` es
  // además el flag de "hay turno / no hay turno" en el template.
  nextBookingDate: Date | null = null;
  nextBookingSpace: string = '';

  private readonly months = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
  ];

  constructor(
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private router: Router,
    public bService: BookingService
  ) { }

  ngOnInit() {
    this.meta.updateTag({ name: 'theme-color', content: '#181b16' });
    this.renderer.setStyle(this.document.body, 'background-color', '#CEA764');
    this.getAvailableSlotsToday();
    this.getComplexSchedule();
    this.getNextBooking();
  }

  ngOnDestroy() {
    this.meta.updateTag({ name: 'theme-color', content: '#000000' });
    this.renderer.removeStyle(this.document.body, 'background-color');
  }

  goToBooking() {
    this.router.navigate(['/booking']);
  }

  goToMyBookings(tab: 'upcoming' | 'past'): void {
    this.router.navigate(['/my-bookings'], {
      state: { selectedTab: tab }
    });
  }

  getAvailableSlotsToday() {
    return this.bService.getAvailableSlotsToday().subscribe({
      next: (r) => {
        this.avaliableSlotsToday = r["Turnos disponibles totales:"];
        console.log(r);
      },
      error: (e) => {
        console.log(e);
      }
    })
  }

  getComplexSchedule() {
    return this.bService.getComplexSchedule().subscribe({
      next: (r) => {

        console.log(r);

        const noScheduleConfigured =
          Object.keys(r).length === 1 && 'open' in r;

        if (noScheduleConfigured) {
          this.noSchedules = true;
          return;
        }

        if (r.dayType) {
          this.dayType = r.dayType;
        }

        if (!r.open) {
          this.closedNow = true;

          if (r.openingTime) {
            this.openingTime = r.openingTime.substring(0, 5);
          }

          return;
        }

        if (r.closingTime) {
          this.closingTime = r.closingTime.substring(0, 5);
        }

      },
      error: (e) => {
        this.scheduleError = true;
        console.log(e);
      }
    })
  }

  formatOpeningDay(day: string): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tomorrowName = tomorrow.toLocaleDateString('es-AR', {
      weekday: 'long'
    });

    return day.toLowerCase() === tomorrowName
      ? 'mañana'
      : `el ${day.toLowerCase()}`;
  }

  getNextBooking() {
    this.bService.getNextBooking().subscribe({
      next: (r) => {
        if (r?.startDatetime) {
          // Guardamos el Date crudo: la card arma día, mes,
          // hora y proximidad a partir de él.
          this.nextBookingDate = new Date(r.startDatetime);
          this.nextBookingSpace = r.spaceName || '';
        } else {
          this.nextBookingDate = null;
          this.nextBookingSpace = '';
        }
      },
      error: () => {
        this.nextBookingDate = null;
        this.nextBookingSpace = '';
      }
    });
  }

  get nextBookingDay(): string {
    return this.nextBookingDate
      ? String(this.nextBookingDate.getDate())
      : '';
  }

  get nextBookingMonth(): string {
    return this.nextBookingDate
      ? this.months[this.nextBookingDate.getMonth()]
      : '';
  }

  get nextBookingTime(): string {
    if (!this.nextBookingDate) return '';

    const h = String(this.nextBookingDate.getHours()).padStart(2, '0');
    const m = String(this.nextBookingDate.getMinutes()).padStart(2, '0');

    return `${h}:${m} hs`;
  }

  get isNextBookingToday(): boolean {
    if (!this.nextBookingDate) return false;

    const startOfDay = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

    return startOfDay(this.nextBookingDate) === startOfDay(new Date());
  }

  get nextBookingRelative(): string {
    if (!this.nextBookingDate) return '';

    const startOfDay = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

    const diffDays = Math.round(
      (startOfDay(this.nextBookingDate) - startOfDay(new Date())) / 86_400_000
    );

    // Hoy no devuelve nada: el tile de la izquierda ya lo dice.
    if (diffDays <= 0) return '';
    if (diffDays === 1) return 'Mañana';
    if (diffDays <= 7) return `En ${diffDays} días`;

    return '';
  }

}
