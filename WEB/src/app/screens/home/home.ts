import {Component, Inject, Renderer2} from '@angular/core';
import { Router } from '@angular/router';

import { BottomNavbar } from '../bottom-navbar/bottom-navbar';
import { Header } from '../header/header';
import {Meta} from '@angular/platform-browser';
import {DOCUMENT} from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [BottomNavbar, Header],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

  availableTurns: number = 3;

  closingHour: string = '23:00';

  constructor(
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private router: Router
  ) {}

  ngOnInit() {
    this.meta.updateTag({ name: 'theme-color', content: '#181b16' });
    this.renderer.setStyle(this.document.body, 'background-color', '#CEA764');
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

}
