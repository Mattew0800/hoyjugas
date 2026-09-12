import {Component, Inject, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {CommonModule, DOCUMENT} from '@angular/common';
import { Header } from '../header/header';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';
import {Meta} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {BookingService} from '../../services/BookingService/booking-service';
import {BookingListDTO} from '../../models/booking.model';

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
export class HistoryBookings implements OnInit, OnDestroy {

  activeTab: 'upcoming' | 'past' = 'upcoming';
  bookings: BookingListDTO[] = [];
  totalElements = 0;

  constructor(
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private router: Router,
    private bService: BookingService
  ) {}


  ngOnInit(): void {

    this.meta.updateTag({ name: 'theme-color', content: '#181b16' });
    this.renderer.setStyle(this.document.body, 'background-color', '#CEA764');


    const state = history.state;

    if (state.selectedTab === 'past') {
      this.activeTab = 'past';
    } else {
      this.activeTab = 'upcoming';
    }


      this.bService.getMyBookings().subscribe({
        next: (response) => {
          this.bookings = response.content;
          this.totalElements = response.totalElements;
        },
        error: (e) => {
          console.log(e);
        }
      });

  }


  ngOnDestroy() {
    this.meta.updateTag({ name: 'theme-color', content: '#000000' });
    this.renderer.removeStyle(this.document.body, 'background-color');
  }

  get filteredBookings(): BookingListDTO[] {
    const now = new Date();
    return this.bookings.filter(b => {
      const start = new Date(b.startDatetime);
      return this.activeTab === 'upcoming' ? start >= now : start < now;
    });
  }

  selectTab(tab: 'upcoming' | 'past') {
    this.activeTab = tab;
  }

  getPaymentClass(booking: BookingListDTO): 'deposit' | 'paid' | 'pending' {
    switch (booking.paymentStatus) {
      case 'PAGADO':
        return 'paid';
      case 'RESERVADO':
        return 'deposit';
      case 'PENDIENTE':
      case 'NO_PAGADO':
      case 'RECHAZADO':
      case 'REEMBOLSADO':
      default:
        return 'pending';
    }
  }

  getPaymentText(booking: BookingListDTO): string {
    switch (booking.paymentStatus) {
      case 'PAGADO': return 'Pagado';
      case 'RESERVADO': return 'Seña pagada';
      case 'PENDIENTE': return 'Pendiente';
      case 'NO_PAGADO': return 'No pagado';
      case 'RECHAZADO': return 'Rechazado';
      case 'REEMBOLSADO': return 'Reembolsado';
      default: return booking.paymentStatus;
    }
  }
  viewDetails(id: number) {
    // navegar a detalle, ej: this.router.navigate(['/bookings', id]);
  }





}
