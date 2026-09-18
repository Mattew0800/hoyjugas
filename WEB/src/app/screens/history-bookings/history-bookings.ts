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
  selectionMode = false;
  selectedBookingId: number | null = null;
  showCancelConfirmModal = false;
  cancelInProgress = false;
  cancelError = '';

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

    const state = history.state ?? {};
    const shouldEnterSelectionMode = state.cancelMode === true;

    if (shouldEnterSelectionMode) {
      this.selectionMode = true;
      this.activeTab = 'upcoming';
    } else if (state.selectedTab === 'past') {
      this.activeTab = 'past';
    } else {
      this.activeTab = 'upcoming';
    }

    this.loadBookings();
  }

  ngOnDestroy() {
    this.meta.updateTag({ name: 'theme-color', content: '#000000' });
    this.renderer.removeStyle(this.document.body, 'background-color');
  }

  private loadBookings(): void {
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

  get filteredBookings(): BookingListDTO[] {
    const now = new Date();

    return this.bookings.filter((booking) => {
      const start = new Date(booking.startDatetime);
      const isCancelled = this.isCancelledBooking(booking);

      if (this.selectionMode) {
        return start >= now && !isCancelled;
      }

      const matchesTab = this.activeTab === 'upcoming'
        ? start >= now && !isCancelled
        : start < now || isCancelled;
      return matchesTab;
    });
  }

  get hasSelectedBooking(): boolean {
    return this.selectedBookingId !== null;
  }

  get screenTitle(): string {
    return this.selectionMode ? 'Cancelar turno' : 'Mis Turnos';
  }

  get screenSubtitle(): string {
    return this.selectionMode
      ? 'Selecciona una reserva para continuar'
      : 'Revisá tus próximas fechas y el historial de partidos.';
  }

  selectTab(tab: 'upcoming' | 'past') {
    if (this.selectionMode) {
      return;
    }

    this.activeTab = tab;
    this.selectedBookingId = null;
  }

  enableSelectionMode(): void {
    this.selectionMode = true;
    this.selectedBookingId = null;
    this.activeTab = 'upcoming';
    this.cancelError = '';
  }

  toggleBookingSelection(bookingId: number): void {
    if (!this.selectionMode) {
      return;
    }

    this.selectedBookingId = this.selectedBookingId === bookingId ? null : bookingId;
    this.cancelError = '';
  }

  openCancelConfirmation(): void {
    if (!this.selectedBookingId) {
      return;
    }

    this.cancelError = '';
    this.showCancelConfirmModal = true;
  }

  closeCancelConfirmation(): void {
    this.showCancelConfirmModal = false;
    this.cancelError = '';
  }

  confirmCancelBooking(): void {
    if (this.selectedBookingId === null) {
      return;
    }

    this.cancelInProgress = true;
    this.cancelError = '';

    this.bService.cancelBooking({
      bookingId: this.selectedBookingId,
      cancellationReason: 'Cancelado por el usuario'
    }).subscribe({
      next: () => {
        this.selectedBookingId = null;
        this.selectionMode = false;
        this.showCancelConfirmModal = false;
        this.cancelInProgress = false;
        this.loadBookings();
      },
      error: (e) => {
        this.cancelError = e?.error || 'No se pudo cancelar la reserva.';
        this.cancelInProgress = false;
      }
    });
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
    if (this.isCancelledBooking(booking)) {
      return 'Cancelado';
    }

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

  isCancelledBooking(booking: BookingListDTO): boolean {
    return booking.status === 'CANCELADO';
  }

  viewDetails(id: number) {
    // navegar a detalle, ej: this.router.navigate(['/bookings', id]);
  }


}
