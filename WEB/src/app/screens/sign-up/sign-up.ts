// sign-up.ts

import {Component, Inject, OnDestroy, OnInit, Renderer2} from '@angular/core';
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
export class SignUp implements OnInit, OnDestroy{

  screenWidth = window.innerWidth;

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
    this.meta.updateTag({ name: 'theme-color', content: '#181b16' });
    this.renderer.setStyle(this.document.body, 'background-color', '#CEA764');
  }

  ngOnDestroy() {
    this.meta.updateTag({ name: 'theme-color', content: '#000000' });
    this.renderer.removeStyle(this.document.body, 'background-color');
  }

  continue(): void {
    console.log('Registro');
  }


  goToLogin(): void {
    this.router.navigate(['/sign-in']);
  }

}
