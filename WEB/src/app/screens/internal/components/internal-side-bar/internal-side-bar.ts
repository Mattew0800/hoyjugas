import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { Router } from '@angular/router';
import {RoleService} from '../../../../services/RoleService/role-service';
import {AuthService} from '../../../../services/AuthService/auth-service';

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
    public roleService: RoleService,
    private authService:AuthService
  ) {}

  showManagementMenu = false;

  showAdministrationMenu = false;

  menuItems = [

    {
      label: 'Turnos de hoy',
      icon: '/assets/emojis/dashboard.svg',
      route: '/internal/dashboard',
      active: true
    },

    {
      label: 'Ventas',
      icon: '/assets/emojis/report.svg',
      route: '/internal/sales',
      active: false
    },

    {
      label: 'Gestión',
      icon: '/field-icon.svg',
      route: '',
      active: false,
      adminOnly: true,
      hasSubmenu: true,
      submenuType: 'management'
    },

    {
      label: 'Administración',
      icon: '/assets/emojis/settings.svg',
      route: '',
      active: false,
      adminOnly: true,
      hasSubmenu: true,
      submenuType: 'administration'
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
      route: '/internal/config',
      active: false,
      adminOnly: true
    }

  ];

  administrationItems = [
    {
      label: 'Productos',
      route: '/internal/products'
    },
    {
      label: 'Categorías',
      route: '/internal/categories'
    },
    {
      label: 'Inventario',
      route: '/internal/inventory'
    },
    {
      label: 'Proveedores',
      route: '/internal/suppliers'
    },
    {
      label: 'Gastos',
      route: '/internal/expenses'
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

    if (item.submenuType === 'management') {
      this.showManagementMenu = !this.showManagementMenu;
      this.showAdministrationMenu = false;
      return;
    }

    if (item.submenuType === 'administration') {
      this.showAdministrationMenu = !this.showAdministrationMenu;
      this.showManagementMenu = false;
      return;
    }

    this.showManagementMenu = false;
    this.showAdministrationMenu = false;

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

  goToAdministration(route: string): void {
    this.router.navigate([route]);
    this.showAdministrationMenu = false;
  }

  logout(): void {

    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/sign-in']);
      }
    });

  }

}
