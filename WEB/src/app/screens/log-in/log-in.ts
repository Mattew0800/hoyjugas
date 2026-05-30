// log-in.ts

import {Component, Inject, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {FormsModule} from '@angular/forms';
import { Router } from '@angular/router';
import {Meta} from '@angular/platform-browser';
import {DOCUMENT} from '@angular/common';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import { faGoogle, faApple } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.html',
  imports: [
    FormsModule,
    FontAwesomeModule,
  ],
  styleUrls: ['./log-in.scss']
})
export class LogIn implements OnInit, OnDestroy{

  screenWidth = window.innerWidth;

  phoneNumber: string = '';
  password: string = '';
  continueBoolean: boolean;
  eyeIcon = faEye;
  eyeIconSlash = faEyeSlash;
  googleIco=faGoogle;
  appleIcon=faApple;
  showPassword: boolean = false;


  constructor(
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private router: Router,
  ) {
    this.continueBoolean = false;
  }

  ngOnInit() {
    //this.meta.updateTag({ name: 'theme-color', content: '#CEA764' });
    this.renderer.setStyle(this.document.body, 'background-color', '#1c1c1c');
  }

  ngOnDestroy() {
    //this.meta.updateTag({ name: 'theme-color', content: '#000000' });
    this.renderer.removeStyle(this.document.body, 'background-color');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  goBack(): void {
    this.continueBoolean = false;
    this.password = '';
    this.showPassword = false;
  }

  continue(): void {
    if(!this.continueBoolean){
      this.continueBoolean=true;
      return;
    }
    this.router.navigate(['/home'])

  }

  goToOnboarding(): void {
    this.router.navigate(['/onboarding']);
  }

  goToSignUp(): void {
    this.router.navigate(['/sign-up']);
  }

  protected readonly faEye = faEye;
  protected readonly faEyeSlash = faEyeSlash;
  protected readonly faGoogle = faGoogle;
  protected readonly faEnvelope = faEnvelope;
  protected readonly faApple = faApple;
}
