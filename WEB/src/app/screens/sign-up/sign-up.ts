// sign-up.ts

import {Component, HostListener, Inject, OnDestroy, OnInit, Renderer2, AfterViewInit} from '@angular/core';
import { Router } from '@angular/router';
import {FormsModule} from '@angular/forms';
import {Meta} from '@angular/platform-browser';
import {DOCUMENT} from '@angular/common';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.html',
  imports: [
    FormsModule
  ],
  styleUrls: ['./sign-up.scss']
})
export class SignUp implements OnInit, OnDestroy, AfterViewInit{

  screenWidth = window.innerWidth;
  private scrollInterval: any;

  fullName: string = '';
  phoneNumber: string = '';
  dni: string = '';
  email: string = '';

  password: string = '';
  confirmPassword: string = '';

  acceptedTerms: boolean = false;

  constructor(
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private router: Router
  ) {}

  ngOnInit() {
    //this.meta.updateTag({ name: 'theme-color', content: '#181b16' });
    this.renderer.setStyle(this.document.body, 'background-color', '#CEA764');
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const continueBtn = this.document.querySelector('.continue-btn');

    if (continueBtn) {
      const rect = continueBtn.getBoundingClientRect();
      // Si el botón está a menos de 150px del bottom de la ventana
      if (rect.bottom <= window.innerHeight + 2000) {
        this.renderer.setStyle(this.document.body, 'background-color', '#1c1c1c');
      } else {
        this.renderer.setStyle(this.document.body, 'background-color', '#CEA764');
      }
    }
  }

  ngAfterViewInit() {
    // Verificar constantemente la posición del botón
    this.scrollInterval = setInterval(() => {
      this.checkScrollPosition();
    }, 100); // Cada 100ms
  }

  checkScrollPosition(): void {
    const continueBtn = this.document.querySelector('.continue-btn');

    if (continueBtn) {
      const rect = continueBtn.getBoundingClientRect();
      console.log('Botón Y:', rect.bottom, 'Window height:', window.innerHeight);

      if (rect.bottom <= window.innerHeight + 50) {
        this.renderer.setStyle(this.document.body, 'background-color', '#1c1c1c');
      } else {
        this.renderer.setStyle(this.document.body, 'background-color', '#CEA764');
      }
    }
  }

  ngOnDestroy() {
    //this.meta.updateTag({ name: 'theme-color', content: '#000000' });
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
    }
    this.renderer.removeStyle(this.document.body, 'background-color');
  }



  continue(): void {
    console.log('Registro');
  }


  goToLogin(): void {
    this.router.navigate(['/sign-in']);
  }

}
