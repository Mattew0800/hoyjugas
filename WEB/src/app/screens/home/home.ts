import {Component, Inject, OnDestroy, OnInit, Renderer2} from '@angular/core';
import { Router } from '@angular/router';

import { BottomNavbar } from '../bottom-navbar/bottom-navbar';
import { Header } from '../header/header';
import {Meta} from '@angular/platform-browser';
import {DOCUMENT} from '@angular/common';
import {BookingService} from '../../services/BookingService/booking-service';

@Component({
  selector: 'app-home',
  imports: [BottomNavbar, Header],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit, OnDestroy{

  availableTurns: number = 3;

  closingHour: string = '23:00';

  closingTime: string = "";

  complexClosed: boolean = false;
  scheduleError: boolean = false;
  avaliableSlotsToday: number = 0;

  constructor(
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private router: Router,
    public bService: BookingService
  ) {}

  ngOnInit() {
    this.meta.updateTag({ name: 'theme-color', content: '#181b16' });
    this.renderer.setStyle(this.document.body, 'background-color', '#CEA764');
    this.getAvaliableSlotsToday();
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

  getAvaliableSlotsToday(){
    return this.bService.getAvaliableSlotsToday().subscribe({
      next: (r)=>{
        this.avaliableSlotsToday = r["Turnos disponibles totales:"];
        console.log(r);
      },
      error: (e)=>{
        console.log(e);
      }
    })
  }

  getComplexSchedule(){
    return this.bService.getComplexSchedule().subscribe({
      next: (r)=>{
        console.log(r);
      },
      error: (e)=>{
        if (e.status === 404) {
          this.complexClosed = true;
        } else {
          this.scheduleError = true;
        }
        console.log(e);
      }
    })
  }

}
