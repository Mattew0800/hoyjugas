import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-internal-side-bar',
  standalone: true,
  imports: [NgFor],
  templateUrl: './internal-side-bar.html',
  styleUrl: './internal-side-bar.scss'
})
export class InternalSideBar {

  constructor(
    private router: Router
  ) {}

  menuItems = [

    {
      label: 'Turnos de hoy',
      icon: '/assets/icons/dashboard.svg',
      route: '/internal/dashboard',
      active: true
    },

    {
      label: 'Calendario',
      icon: '/assets/icons/calendar.svg',
      route: '/internal/calendar',
      active: false
    },

    {
      label: 'Canchas',
      icon: '/assets/icons/field.svg',
      route: '/internal/fields',
      active: false
    },

    {
      label: 'Clientes',
      icon: '/assets/icons/users.svg',
      route: '/internal/customers',
      active: false
    },

    {
      label: 'Reportes',
      icon: '/assets/icons/report.svg',
      route: '/internal/reports',
      active: false
    },

    {
      label: 'Ajustes',
      icon: '/assets/icons/settings.svg',
      route: '/internal/settings',
      active: false
    }

  ];

  navigate(route: string): void {

    this.router.navigate([route]);

  }

  logout(): void {

    console.log('Cerrar sesión');

  }

}
