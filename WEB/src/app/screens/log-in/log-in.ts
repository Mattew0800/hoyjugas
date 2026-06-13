// log-in.ts

import {Component, Inject, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import {Meta} from '@angular/platform-browser';
import {DOCUMENT} from '@angular/common';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import { faGoogle, faApple } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import {CustomValidators} from '../../validators/custom-validators';
import {AuthService} from '../../services/AuthService/auth-service';
import {LoginRequestDTO} from '../../models/LoginRequestDTO';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
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
  form: FormGroup;
  formErrorMsg: string = '';


  constructor(
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private router: Router,
    private authService: AuthService
  ) {
    this.continueBoolean = false;
    this.form = new FormGroup({
      email: new FormControl('',[
        Validators.required,
        Validators.pattern(/^(?!.*\.{2})[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/),
        Validators.maxLength(254)
        //Prohíbe puntos consecutivos
        //Exige que el local-part no empiece/termine con punto
        //Controla que los guiones en el dominio no estén al inicio/final
        //Requiere TLD de al menos 2 letras
        //Permite subdominios
      ]),
      password: new FormControl('',Validators.required)
    })
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

  login(){

    const user : LoginRequestDTO = {
      email: this.form.value.phone!,
      password: this.form.value.password!
    }

    this.authService.logUser(user).subscribe({
      next: (r)=>{
        this.router.navigate(['/home']);
      },
      error: (e)=>{
        console.log(e);
        this.formErrorMsg = 'Email o contraseña incorrectos.'
      }

    })
  }

  protected readonly faEye = faEye;
  protected readonly faEyeSlash = faEyeSlash;
  protected readonly faGoogle = faGoogle;
  protected readonly faEnvelope = faEnvelope;
  protected readonly faApple = faApple;
}
