import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';

import { BottomNavbar } from '../bottom-navbar/bottom-navbar';
import { Header } from '../header/header';
import { Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { BookingService } from '../../services/BookingService/booking-service';

@Component({
  selector: 'app-home',
  imports: [BottomNavbar, Header],
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

}
