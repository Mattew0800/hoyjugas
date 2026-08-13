import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import {CommonModule, DOCUMENT} from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../header/header';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';
import { UserService } from '../../services/UserService/user-service';
import { FormsModule } from '@angular/forms';
import {Meta} from '@angular/platform-browser';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Header,
    BottomNavbar
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit{

  user = {
    fullName: '',
    phone: '',
    email: ''
  };

  successMessage = '';
  errorMessage = '';

  constructor(
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private router: Router,
    private userService: UserService
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
        next: (user: any) => {

          this.user.fullName = user.name;
          this.user.phone = user.phone;
          this.user.email = user.email;

        },
        error: err => console.error(err)
      });

  }

  saveProfile(): void {

    this.successMessage = '';
    this.errorMessage = '';

    const payload = {
      name: this.user.fullName,
      phone: this.user.phone,
      email: this.user.email
    };

    this.userService.updateMe(payload)
      .subscribe({
        next: () => {

          this.successMessage =
            'Perfil actualizado correctamente';

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: () => {

          this.errorMessage =
            'No se pudieron guardar los cambios';

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        }
      });

  }

  changePassword(): void {
    this.router.navigate(['/change-password']);
  }

  changePhoto(): void {
    console.log('Cambiar foto');
  }
}
