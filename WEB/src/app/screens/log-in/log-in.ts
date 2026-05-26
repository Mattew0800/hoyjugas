// log-in.ts

import {Component, Inject, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {FormsModule} from '@angular/forms';
import { Router } from '@angular/router';
import {Meta} from '@angular/platform-browser';
import {DOCUMENT} from '@angular/common';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.html',
  imports: [
    FormsModule
  ],
  styleUrls: ['./log-in.scss']
})
export class LogIn implements OnInit, OnDestroy{

  screenWidth = window.innerWidth;

  phoneNumber: string = '';
  password: string = '';
  continueBoolean: boolean;


  constructor(
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private router: Router,
  ) {
    this.continueBoolean = false;
  }

  ngOnInit() {
    this.meta.updateTag({ name: 'theme-color', content: '#181b16' });
    this.renderer.setStyle(this.document.body, 'background-color', '#CEA764');
  }

  ngOnDestroy() {
    this.meta.updateTag({ name: 'theme-color', content: '#000000' });
    this.renderer.removeStyle(this.document.body, 'background-color');
  }


  continue(): void {
    this.continueBoolean=true;
    console.log('Número:', this.phoneNumber);
  }

  goToOnboarding(): void {
    this.router.navigate(['/onboarding']);
  }

  goToSignUp(): void {
    this.router.navigate(['/sign-up']);
  }
}
