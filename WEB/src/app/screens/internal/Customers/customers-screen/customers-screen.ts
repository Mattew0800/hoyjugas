import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UserService } from '../../../../services/UserService/user-service';
import { RoleService } from '../../../../services/RoleService/role-service';
import { CustomerModel } from '../../models/user-response';
import { InternalHeader } from '../../components/internal-header/internal-header';
import { InternalSideBar } from '../../components/internal-side-bar/internal-side-bar';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-customers-screen',
  standalone: true,
  imports: [FormsModule, InternalHeader, InternalSideBar],
  templateUrl: './customers-screen.html',
  styleUrl: './customers-screen.scss'
})
export class CustomersScreen implements OnInit {
  customers: CustomerModel[] = [];
  searchTerm = '';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  loading = false;
  isAdmin = false;
  confirmingAction: 'desactivate' | 'activate' | null = null;
  confirmingCustomerId: number | null = null;
  errorMessage: string | null = null;
  private customersSubscription?: Subscription;

  constructor(
    private userService: UserService,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.roleService.isAdmin();
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.customersSubscription?.unsubscribe();

    this.loading = true;
    this.errorMessage = null;

    let enabled: boolean | undefined;

    if (this.statusFilter === 'active') {
      enabled = true;
    }

    if (this.statusFilter === 'inactive') {
      enabled = false;
    }

    this.customersSubscription= this.userService.getClients(enabled).subscribe({
      next: customers => {
        this.customers = customers;
        this.loading = false;
      },
      error: error => {
        console.error('ERROR AL OBTENER CLIENTES:', error);
        this.loading = false;
        this.errorMessage = 'No se pudieron cargar los clientes.';
      }
    });
  }

  changeStatusFilter(
    filter: 'all' | 'active' | 'inactive'
  ): void {
    this.statusFilter = filter;
    this.loadCustomers();
  }

  desactivateCustomer(id: number): void {
    this.userService.desactivateUser(id).subscribe({
      next: () => {
        this.loadCustomers();
      },
      error: error => {
        console.error('ERROR AL DAR DE BAJA CLIENTE:', error);
      }
    });
  }

  activateCustomer(id: number): void {
    this.userService.activateUser(id).subscribe({
      next: () => {
        this.loadCustomers();
      },
      error: error => {
        console.error('ERROR AL DAR DE ALTA CLIENTE:', error);
      }
    });
  }

  get filteredCustomers(): CustomerModel[] {
    const search = this.searchTerm.trim().toLowerCase();

    if (!search) {
      return this.customers;
    }

    return this.customers.filter(customer =>
      customer.name?.toLowerCase().includes(search) ||
      customer.email?.toLowerCase().includes(search) ||
      customer.dni?.toLowerCase().includes(search) ||
      customer.phone?.toLowerCase().includes(search)
    );
  }

  confirmAction(
    action: 'desactivate' | 'activate',
    customerId: number
  ): void {
    this.confirmingAction = action;
    this.confirmingCustomerId = customerId;
  }

  cancelAction(): void {
    this.confirmingAction = null;
    this.confirmingCustomerId = null;
  }

  executeAction(): void {
    if (
      this.confirmingCustomerId === null ||
      this.confirmingAction === null
    ) {
      return;
    }

    const customerId = this.confirmingCustomerId;

    if (this.confirmingAction === 'desactivate') {
      this.userService.desactivateUser(customerId).subscribe({
        next: () => {
          this.cancelAction();
          this.loadCustomers();
        },
        error: error => {
          console.error('ERROR AL DAR DE BAJA CLIENTE:', error);
          this.cancelAction();
          this.errorMessage = 'No se pudo dar de baja al cliente.';
        }
      });

      return;
    }

    this.userService.activateUser(customerId).subscribe({
      next: () => {
        this.cancelAction();
        this.loadCustomers();
      },
      error: error => {
        console.error('ERROR AL DAR DE ALTA CLIENTE:', error);
        this.cancelAction();
        this.errorMessage = 'No se pudo dar de alta al cliente.';
      }
    });
  }
}
