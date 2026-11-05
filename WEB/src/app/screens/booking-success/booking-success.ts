import { Component, ElementRef, AfterViewInit, ViewChild, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import lottie, { AnimationItem } from 'lottie-web';
import { Header } from '../header/header';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';
import { BookingStateService } from '../../services/BookingStateService/booking-state-service';
import { BookingService } from '../../services/BookingService/booking-service';

@Component({
  selector: 'app-booking-success',
  imports: [Header, BottomNavbar],
  templateUrl: './booking-success.html',
  styleUrl: './booking-success.scss',
})
export class BookingSuccess implements OnInit, AfterViewInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private bookingState = inject(BookingStateService);
  private bookingService = inject(BookingService);
  private readonly destroy$ = new Subject<void>();

  @ViewChild('lottieContainer', { static: true }) lottieContainer!: ElementRef;
  private animationItem?: AnimationItem;
  fieldName = 'Cancha';
  selectedFieldText = 'Selecciona un horario';

  ngOnInit(): void {
    const draft = this.bookingState.snapshot;
    if (draft.spaceName || draft.startDateTime) {
      this.fieldName = [draft.spaceName, draft.spaceType].filter(Boolean).join(' • ') || 'Cancha';
      this.selectedFieldText = this.formatSelectedDateTime(draft.startDateTime);
    }

    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const rawId = params.get('bookingId') ?? params.get('external_reference');
        if (rawId) {
          const bookingId = Number(rawId);
          if (!isNaN(bookingId)) {
            if (!draft.spaceName && !draft.startDateTime) {
              this.fieldName = 'Cargando reserva...';
              this.selectedFieldText = 'Obteniendo detalles...';
            }

            this.bookingService
              .getBookingDetail({ bookingId })
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (res) => {
                  this.fieldName =
                    [res.spaceName, res.spaceType].filter(Boolean).join(' • ') || 'Cancha';
                  this.selectedFieldText = this.formatSelectedDateTime(res.startDatetime);
                  this.bookingState.patch({
                    spaceId: res.spaceId,
                    spaceName: res.spaceName,
                    spaceType: res.spaceType,
                    startDateTime: res.startDatetime,
                  });
                },
                error: (err) => {
                  console.error('Error al recuperar detalles de la reserva:', err);
                  if (this.fieldName === 'Cargando reserva...') {
                    this.fieldName = 'Cancha';
                    this.selectedFieldText = 'Reserva confirmada';
                  }
                },
              });
          }
        }
      });
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
    this.destroy$.next();
    this.destroy$.complete();
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
