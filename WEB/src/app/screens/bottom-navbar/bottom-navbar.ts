import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-navbar',
  templateUrl: './bottom-navbar.html',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  styleUrls: ['./bottom-navbar.scss']
})
export class BottomNavbar {

  showWhatsappModal = false;
  private previousFocus: HTMLElement | null = null;
  @ViewChild('whatsappModal') modalElement?: ElementRef<HTMLElement>;

  constructor(private router: Router) {}

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  goToContact(): void {
    this.router.navigate(['/contact']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  openWhatsappModal(): void {
    this.previousFocus = document.activeElement as HTMLElement;
    this.showWhatsappModal = true;
    setTimeout(() => {
      this.modalElement?.nativeElement.focus();
    });
  }

  closeWhatsappModal(): void {
    this.showWhatsappModal = false;
    if (this.previousFocus) {
      this.previousFocus.focus();
    }
  }

  openWhatsapp(): void {
    window.open(
      'https://wa.me/5492234566785?text=Hola,%20quiero%20hacer%20una%20consulta',
      '_blank'
    );

    this.closeWhatsappModal();
  }

  onModalKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeWhatsappModal();
      return;
    }

    if (event.key === 'Tab') {
      const focusableElements = this.modalElement?.nativeElement.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    }
  }
}
