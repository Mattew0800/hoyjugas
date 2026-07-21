import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import { Header } from '../header/header';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';
import { Router } from '@angular/router';
import {CommonModule, DOCUMENT} from '@angular/common';
import {BookingService} from '../../services/BookingService/booking-service';

@Component({
  selector: 'app-booking',
  imports: [
    Header,
    BottomNavbar,
    CommonModule
  ],
  templateUrl: './booking.html',
  styleUrl: './booking.scss',
})
export class Booking implements OnInit{

  selectedFieldType: 'futbol5' | 'futbol7' = 'futbol5';

  selectedDate: Date = new Date();

  closingTime: string = "";

  constructor(
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    public bService: BookingService
  ) {

  }

  ngOnInit() {
    //this.meta.updateTag({ name: 'theme-color', content: '#CEA764' });
    this.renderer.setStyle(this.document.body, 'background-color', '#CEA764');

  }

  get activeIndex(): number {
    return this.selectedFieldType === 'futbol5' ? 0 : 1;
  }

  selectFieldType(type: 'futbol5' | 'futbol7'): void {
    this.selectedFieldType = type;
  }

  onDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    if (value) {
      this.selectedDate = new Date(value);
    }
  }

  goToFieldSchedule(): void {
    this.router.navigate(['/field-schedule']);
  }



}

