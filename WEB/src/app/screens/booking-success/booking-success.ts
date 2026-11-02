import { Component, ElementRef, AfterViewInit, ViewChild, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import lottie, { AnimationItem } from 'lottie-web';
import { Header } from '../header/header';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';
import { BookingStateService } from '../../services/BookingStateService/booking-state-service';

@Component({
  selector: 'app-booking-success',
  imports: [Header, BottomNavbar],
  templateUrl: './booking-success.html',
  styleUrl: './booking-success.scss',
})
export class BookingSuccess implements OnInit, AfterViewInit, OnDestroy {
  private router = inject(Router);
  private bookingState = inject(BookingStateService);

  @ViewChild('lottieContainer', { static: true }) lottieContainer!: ElementRef;
  private animationItem?: AnimationItem;
  fieldName = 'Cancha';
  selectedFieldText = 'Selecciona un horario';

  ngOnInit(): void {
    const draft = this.bookingState.snapshot;
    this.fieldName = [draft.spaceName, draft.spaceType].filter(Boolean).join(' • ') || 'Cancha';
    this.selectedFieldText = this.formatSelectedDateTime(draft.startDateTime);
  }

  ngAfterViewInit(): void {
    this.animationItem = lottie.loadAnimation({
      container: this.lottieContainer.nativeElement,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      path: '/assets/animations/success-check.json'
    });
  }

  ngOnDestroy(): void {
    this.animationItem?.destroy();
  }

  goToReservations() {
    this.bookingState.reset();
    this.router.navigate(['/my-bookings']);
  }

  goHome() {
    this.bookingState.reset();
    this.router.navigate(['/home']);
  }

  private formatSelectedDateTime(dateTimeString: string | null): string {
    if (!dateTimeString) return 'Selecciona un horario';

    const normalized = dateTimeString.includes('T') ? dateTimeString : `${dateTimeString}T00:00:00`;
    const [datePart, timePart] = normalized.split('T');
    const [year, month, day] = datePart.split('-').map(Number);

    if (!year || !month || !day) return 'Selecciona un horario';

    const date = new Date(year, month - 1, day);
    const weekday = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][date.getDay()];
    const monthName = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][date.getMonth()];

    const timeLabel = timePart ? `${timePart.substring(0, 5)} hs` : '';
    return timeLabel
      ? `${weekday} ${day} de ${monthName} · ${timeLabel}`
      : `${weekday} ${day} de ${monthName}`;
  }
}
