import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import {CommonModule, DOCUMENT} from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../header/header';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';
import { UserService } from '../../services/UserService/user-service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {Meta} from '@angular/platform-browser';
import {AuthService} from '../../services/AuthService/auth-service';
import {User} from '../../models/User';
import {CustomValidators} from '../../validators/custom-validators';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Header,
    BottomNavbar
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit{

  profileForm = new FormGroup({
    fullName: new FormControl('',[
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
  });

  selectedPhotoPreview: string | null = null;
  successMessage = '';
  errorMessage = '';
  infoMessage = '';

  private originalProfile: { name: string; phone: string; email: string } | null = null;

  constructor(
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private router: Router,
    private userService: UserService,
    private authService: AuthService
  ) {}



  ngOnInit(): void {

    this.meta.updateTag({ name: 'theme-color', content: '#181b16' });
    this.renderer.setStyle(this.document.body, 'background-color', '#CEA764');

    if (history.state.passwordUpdated) {

      this.successMessage =
        'Contraseña actualizada correctamente';

      setTimeout(() => {
        this.successMessage = '';
      }, 3000);

    }

    this.userService.getMe()
      .subscribe({
        next: (user: User) => {

          this.profileForm.patchValue({
            fullName: user.name,
            phone: user.phone,
            email: user.email
          });
          this.originalProfile = {
            name: user.name,
            phone: user.phone,
            email: user.email
          };

        },
        error: err => console.error(err)
      });

  }

  saveProfile(): void {

    this.successMessage = '';
    this.errorMessage = '';
    this.infoMessage = '';

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const value = this.profileForm.getRawValue();
    const payload = {
      name: value.fullName ?? '',
      phone: value.phone ?? '',
      email: value.email ?? ''
    };

    if (
      this.originalProfile &&
      payload.name === this.originalProfile.name &&
      payload.phone === this.originalProfile.phone &&
      payload.email === this.originalProfile.email
    ) {
      this.profileForm.markAsPristine();
      this.infoMessage = 'No realizaste cambios en el perfil';

      setTimeout(() => {
        this.infoMessage = '';
      }, 3000);
      return;
    }

    this.userService.updateMe(payload).subscribe({

        next: (user: User) => {

          this.profileForm.patchValue({
            fullName: user.name,
            phone: user.phone,
            email: user.email
          });
          this.profileForm.markAsPristine();
          this.originalProfile = {
            name: user.name,
            phone: user.phone,
            email: user.email
          };
          this.authService.setCurrentUser(user);

          this.successMessage =
            'Perfil actualizado correctamente';

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);

        },
        error: (err) => {

          this.errorMessage = err.error;

          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });

  }

  changePassword(): void {
    this.router.navigate(['/change-password']);
  }

  changePhoto(): void {
    const photoInput = this.document.getElementById('profile-photo-input') as HTMLInputElement | null;
    photoInput?.click();
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      console.warn('El archivo seleccionado no es una imagen válida.');
      input.value = '';
      return;
    }

    if (this.selectedPhotoPreview) {
      URL.revokeObjectURL(this.selectedPhotoPreview);
    }

    this.selectedPhotoPreview = URL.createObjectURL(file);
    input.value = '';
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/sign-in']);
      },
      error: err => console.error('Error al cerrar sesión', err)
    });
  }
}
