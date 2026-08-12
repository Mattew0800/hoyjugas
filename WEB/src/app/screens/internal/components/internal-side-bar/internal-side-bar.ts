import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { Router } from '@angular/router';
import {RoleService} from '../../../../services/RoleService/role-service';

@Component({
  selector: 'app-internal-side-bar',
  standalone: true,
  imports: [NgFor],
  templateUrl: './internal-side-bar.html',
  styleUrl: './internal-side-bar.scss'
})
export class InternalSideBar implements OnInit{

  constructor(
    private router: Router,
    public roleService: RoleService
  ) {}

  showManagementMenu = false;

  menuItems = [

    {
      label: 'Turnos de hoy',
      icon: '/assets/emojis/dashboard.svg',
      route: '/internal/dashboard',
      active: true
    },

    {
      label: 'Calendario',
      icon: '/assets/emojis/calendario.svg',
      route: '/internal/calendar',
      active: false
    },

    {
      label: 'Gestión',
      icon: '/field-icon.svg',
      route: '',
      active: false,
      adminOnly: true,
      hasSubmenu: true
    },

    {
      label: 'Clientes',
      icon: '/assets/emojis/persona.svg',
      route: '/internal/customers',
      active: false
    },

    {
      label: 'Reportes',
      icon: '/assets/emojis/report.svg',
      route: '/internal/reports',
      active: false
    },

    {
      label: 'Ajustes',
      icon: '/assets/emojis/settings.svg',
      route: '/internal/settings',
      active: false
    }

  ];


  ngOnInit(): void {

    if (!this.roleService.isAdmin()) {
      this.menuItems = this.menuItems.filter(
        item => !item.adminOnly
      );
    }

  }

  navigate(item: any): void {

    if (item.hasSubmenu) {
      this.showManagementMenu = !this.showManagementMenu;
      return;
    }

    this.router.navigate([item.route]);
  }

  goToSpaces(): void {
    this.router.navigate(['/internal/spaces']);
    this.showManagementMenu = false;
  }

  goToEmployees(): void {
    this.router.navigate(['/internal/employees']);
    this.showManagementMenu = false;
  }

  logout(): void {

    console.log('Cerrar sesión');

  }

}
