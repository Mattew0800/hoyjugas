import {
  Component,
  ElementRef, OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UserService } from '../../../../services/UserService/user-service';
import { RoleService } from '../../../../services/RoleService/role-service';
import { ErrorHandlerService } from '../../../../services/ErrorHandlerService/error-handler.service';

import { CustomerModel } from '../../models/user-response';
import { UserDetailModel } from '../../models/user-detail.model';

import { InternalHeader } from '../../components/internal-header/internal-header';
import { InternalSideBar } from '../../components/internal-side-bar/internal-side-bar';

import { Subscription } from 'rxjs';

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
export class CustomersScreen implements OnInit, OnDestroy {

  @ViewChild('customerDetailModal')
  customerDetailModal?: ElementRef<HTMLElement>;

  customers: CustomerModel[] = [];
  searchTerm = '';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  loading = false;
  isAdmin = false;

  confirmingAction:
    'desactivate' | 'activate' | null = null;

  confirmingCustomerId: number | null = null;

  errorMessage: string | null = null;

  processingAction = false;

  selectedCustomer: UserDetailModel | null = null;
  showCustomerDetail = false;
  customerDetailLoading = false;
  customerDetailError = '';

  private customersSubscription?: Subscription;
  private customerDetailSubscription?: Subscription;
  private customerDetailTrigger: HTMLElement | null = null;

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.roleService.isAdmin();
    this.loadCustomers();
  }

  ngOnDestroy(): void {
    this.customersSubscription?.unsubscribe();
    this.customerDetailSubscription?.unsubscribe();
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

    this.customersSubscription =
      this.userService.getClients(enabled).subscribe({
        next: customers => {
          this.customers = customers;
          this.loading = false;
        },
        error: error => {
          this.loading = false;
          this.errorMessage =
            this.errorHandler.getMessage(error);
        }
      });
  }

  changeStatusFilter(
    filter: 'all' | 'active' | 'inactive'
  ): void {
    this.statusFilter = filter;
    this.loadCustomers();
  }

  openCustomerDetail(id: number): void {
    this.customerDetailSubscription?.unsubscribe();

    this.customerDetailTrigger =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    this.customerDetailLoading = true;
    this.customerDetailError = '';
    this.selectedCustomer = null;
    this.showCustomerDetail = true;

    setTimeout(() => {
      this.customerDetailModal?.nativeElement.focus();
    });

    this.customerDetailSubscription =
      this.userService.getUserDetail(id).subscribe({
        next: customer => {
          this.selectedCustomer = customer;
          this.customerDetailLoading = false;
        },
        error: error => {
          this.customerDetailLoading = false;
          this.customerDetailError =
            this.errorHandler.getMessage(error);
        }
      });
  }

  closeCustomerDetail(): void {
    this.customerDetailSubscription?.unsubscribe();
    this.customerDetailSubscription = undefined;

    this.showCustomerDetail = false;
    this.selectedCustomer = null;
    this.customerDetailLoading = false;
    this.customerDetailError = '';

    setTimeout(() => {
      this.customerDetailTrigger?.focus();
      this.customerDetailTrigger = null;
    });
  }

  handleCustomerDetailKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !this.customerDetailModal) {
      return;
    }

    const modal = this.customerDetailModal.nativeElement;

    const focusableElements = Array.from(
      modal.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      )
    );

    if (focusableElements.length === 0) {
      event.preventDefault();
      modal.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement =
      focusableElements[focusableElements.length - 1];

    if (
      event.shiftKey &&
      document.activeElement === firstElement
    ) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (
      !event.shiftKey &&
      document.activeElement === lastElement
    ) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  desactivateCustomer(id: number): void {
    this.userService.desactivateUser(id).subscribe({
      next: () => {
        this.loadCustomers();
      },
      error: error => {
        this.errorMessage =
          this.errorHandler.getMessage(error);
      }
    });
  }

  activateCustomer(id: number): void {
    this.userService.activateUser(id).subscribe({
      next: () => {
        this.loadCustomers();
      },
      error: error => {
        this.errorMessage =
          this.errorHandler.getMessage(error);
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
    this.errorMessage = null;
    this.confirmingAction = action;
    this.confirmingCustomerId = customerId;
  }

  cancelAction(): void {
    if (this.processingAction) {
      return;
    }

    this.confirmingAction = null;
    this.confirmingCustomerId = null;
  }

  executeAction(): void {
    if (
      this.confirmingCustomerId === null ||
      this.confirmingAction === null ||
      this.processingAction
    ) {
      return;
    }

    const customerId = this.confirmingCustomerId;
    const action = this.confirmingAction;

    this.processingAction = true;
    this.errorMessage = null;

    const request =
      action === 'desactivate'
        ? this.userService.desactivateUser(customerId)
        : this.userService.activateUser(customerId);

    request.subscribe({
      next: () => {
        this.processingAction = false;
        this.cancelAction();
        this.loadCustomers();
      },
      error: error => {
        this.processingAction = false;
        this.cancelAction();
        this.errorMessage =
          this.errorHandler.getMessage(error);
      }
    });
  }
}
