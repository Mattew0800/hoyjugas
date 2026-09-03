import { Component, ElementRef, AfterViewInit, ViewChild, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import lottie, { AnimationItem } from 'lottie-web';
import { Header } from '../header/header';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';

@Component({
  selector: 'app-booking-success',
  imports: [Header, BottomNavbar],
  templateUrl: './booking-success.html',
  styleUrl: './booking-success.scss',
})
export class BookingSuccess implements AfterViewInit, OnDestroy {
  private router = inject(Router);

  @ViewChild('lottieContainer', { static: true }) lottieContainer!: ElementRef;
  private animationItem?: AnimationItem;

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
    this.router.navigate(['/reservations']);
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
