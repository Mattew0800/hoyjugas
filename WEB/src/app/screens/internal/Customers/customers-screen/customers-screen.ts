import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import  {UserService} from '../../../../services/UserService/user-service';
import { CustomerModel} from '../../models/user-response';
import {InternalHeader} from '../../components/internal-header/internal-header';
import {InternalSideBar} from '../../components/internal-side-bar/internal-side-bar';

@Component({
  selector: 'app-customers-screen',
  standalone: true,
  imports: [
    FormsModule,
    InternalHeader,
    InternalSideBar
  ],
  templateUrl: './customers-screen.html',
  styleUrl: './customers-screen.scss'
})
export class CustomersScreen implements OnInit {

  customers: CustomerModel[] = [];

  searchTerm = '';

  loading = false;

  constructor(
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {

    this.loading = true;

    this.userService.getClients().subscribe({

      next: (customers) => {

        this.customers = customers;

        this.loading = false;

      },

      error: (error) => {

        console.error('ERROR AL OBTENER CLIENTES:', error);

        this.loading = false;

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

}
