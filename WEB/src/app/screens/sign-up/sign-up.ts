// sign-up.ts

import {Component, HostListener, Inject, OnDestroy, OnInit, Renderer2, AfterViewInit} from '@angular/core';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule, ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {Meta} from '@angular/platform-browser';
import {DOCUMENT} from '@angular/common';
import {CustomValidators} from '../../validators/custom-validators';
import {AuthService} from '../../services/AuthService/auth-service';
import {RegisterRequestDTO} from '../../models/RegisterRequestDTO';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.html',
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  styleUrls: ['./sign-up.scss']
})
export class SignUp implements OnInit, OnDestroy, AfterViewInit{

  screenWidth = window.innerWidth;
  private scrollInterval: any;


  acceptedTerms: boolean = false;

  form: FormGroup;

  formErrorMsg: string = '';

  constructor(
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private router: Router,
    public authService: AuthService
  ) {
    this.form = new FormGroup({
        name: new FormControl('',[
          Validators.required,
          Validators.pattern(/^(?:[A-Za-zÁÉÍÓÚáéíóúÑñ]{2,}|de|del|la|los|san)(?:\s(?:[A-Za-zÁÉÍÓÚáéíóúÑñ]{2,}|de|del|la|los|san))+$/i),
          // Solo letras (con tildes/ñ), al menos dos palabras (espacio en medio)
          // Permite "de", "del", "la", "los", "san" | Sin simbolos o espacios extra.
          Validators.maxLength(50),
          CustomValidators.maxWordsValidator(5)
        ]),

      phone: new FormControl('',[
        Validators.required,
        Validators.pattern(/^([0-9]{2,4})\s?([0-9]{7,8})$|^([0-9]{2,4})\s?([0-9]{3})\s?([0-9]{4,5})$/),
        CustomValidators.argentinePhoneValidator()
      ]),

      dni: new FormControl('',[
        Validators.required,
        Validators.pattern(/^([0-9]{1,3}\.?){2}[0-9]{3,4}$|^[0-9]{7,10}$/),
        CustomValidators.argentineDniValidator()
      ]),

      email: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?!.*\.{2})[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/),
        Validators.maxLength(254)
        //Prohíbe puntos consecutivos
        //Exige que el local-part no empiece/termine con punto
        //Controla que los guiones en el dominio no estén al inicio/final
        //Requiere TLD de al menos 2 letras
        //Permite subdominios
      ]),

      password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.pattern(/\S/)]),

      confirmPassword: new FormControl('', [
        Validators.required,
      ]),

      terms: new FormControl(false, [Validators.requiredTrue])

    }, { validators: CustomValidators.passwordsMatchValidator() })
  }

  ngOnInit() {
    //this.meta.updateTag({ name: 'theme-color', content: '#181b16' });
    this.renderer.setStyle(this.document.body, 'background-color', '#CEA764');
  }

  ngOnDestroy() {
    //this.meta.updateTag({ name: 'theme-color', content: '#000000' });
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
    }
    this.renderer.removeStyle(this.document.body, 'background-color');
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

      if (rect.bottom <= window.innerHeight + 50) {
        this.renderer.setStyle(this.document.body, 'background-color', '#1c1c1c');
      } else {
        this.renderer.setStyle(this.document.body, 'background-color', '#CEA764');
      }
    }
  }

  maxWordsValidator(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';
      const words = value.trim().split(/\s+/).filter((w: string) => w.length > 0);
      return words.length > max ? { maxWords: { requiredMax: max, actual: words.length } } : null;
    };
  }


  register(){
    this.form.markAllAsTouched();

    const user : RegisterRequestDTO = {
      name: this.form.value.name,
      phone: this.form.value.phone,
      dni: this.form.value.dni,
      email: this.form.value.email,
      password: this.form.value.password
    }

    if (this.form.invalid){
      return;
    }

    this.authService.registerUser(user).subscribe({
      next: (r)=>{
        this.router.navigate(['/sign-in']);
      },
      error:(e)=>{
        console.log(e);
        this.formErrorMsg = e.error;
      }
    })
  }

  goToLogin(): void {
    this.router.navigate(['/sign-in']);
  }

}
