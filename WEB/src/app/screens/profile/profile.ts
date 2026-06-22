import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../header/header';
import { BottomNavbar } from '../bottom-navbar/bottom-navbar';
import { FormsModule } from '@angular/forms';


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
export class Profile {

  user = {
    fullName: 'Martín',
    phone: '+54 9 11 1234-5678',
    email: 'martin.aztk@email.com'
  };

  constructor(
    private router: Router
  ) {}

  saveProfile(): void {
    console.log('Guardar cambios');
  }

  changePassword(): void {
    this.router.navigate(['/change-password']);
  }

  changePhoto(): void {
    console.log('Cambiar foto');
  }
}
