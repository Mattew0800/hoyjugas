import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { InternalSideBar } from '../../components/internal-side-bar/internal-side-bar';
import { InternalHeader } from '../../components/internal-header/internal-header';

import {
  EmployeeModal,
  EmployeeModel,
  EmployeeCreateModel
} from '../employee-modal/employee-modal';

import { EmployeeService } from '../../../../services/EmployeeService/employee-service';
import { ErrorHandlerService } from '../../../../services/ErrorHandlerService/error-handler.service';
import { PinModal } from '../pin-modal/pin-modal';
import { EmployeeUpdateModel } from '../../models/employee-modal';

@Component({
  selector: 'app-employees-screen',
  standalone: true,
  imports: [
    FormsModule,
    InternalHeader,
    InternalSideBar,
    EmployeeModal,
    PinModal
  ],
  templateUrl: './employees-screen.html',
  styleUrl: './employees-screen.scss'
})
export class EmployeesScreen implements OnInit, OnDestroy {

  constructor(
    private employeeService: EmployeeService,
    private errorHandler: ErrorHandlerService
  ) {}

  private subscriptions = new Subscription();

  searchTerm = '';

  showEmployeeModal = false;

  selectedEmployee?: EmployeeModel;

  private employeeDetailSubscription?: Subscription;

  employees: EmployeeModel[] = [];

  loadingEmployees = false;

  errorMessage = '';

  showPinModal = false;

  selectedEmployeeForPin?: EmployeeModel;

  newPin = '';

  confirmPin = '';

  pinError = '';

  savingPin = false;

  showDismissConfirmation = false;

  selectedEmployeeForDismiss?: EmployeeModel;

  dismissingEmployee = false;

  showingHistory = false;

  historyEmployees: EmployeeModel[] = [];

  loadingHistory = false;

  showRehireConfirmation = false;

  selectedEmployeeForRehire?: EmployeeModel;

  rehiringEmployee = false;

  ngOnInit(): void {
    this.loadEmployees();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.employeeDetailSubscription?.unsubscribe();
  }

  loadEmployees(): void {
    this.loadingEmployees = true;
    this.errorMessage = '';

    this.subscriptions.add(
      this.employeeService
        .getActiveStaff()
        .subscribe({
          next: employees => {
            this.employees = employees;
            this.loadingEmployees = false;
          },

          error: error => {
            this.errorMessage =
              this.errorHandler.getMessage(error);

            this.loadingEmployees = false;
          }
        })
    );
  }

  get filteredEmployees(): EmployeeModel[] {
    const search =
      this.searchTerm
        .trim()
        .toLowerCase();

    const employeesToShow =
      this.showingHistory
        ? this.historyEmployees
        : this.employees;

    if (!search) {
      return employeesToShow;
    }

    return employeesToShow.filter(employee =>
      employee.name
        .toLowerCase()
        .includes(search)

      ||

      employee.email
        .toLowerCase()
        .includes(search)

      ||

      employee.phone
        .includes(search)

      ||

      employee.role
        .toLowerCase()
        .includes(search)
    );
  }

  openNewEmployee(): void {
    this.selectedEmployee = undefined;
    this.showEmployeeModal = true;
  }

  editEmployee(
    employee: EmployeeModel
  ): void {

    this.employeeDetailSubscription?.unsubscribe();

    this.employeeDetailSubscription =
      this.employeeService
        .getEmployeeDetail(employee.id)
        .subscribe({
          next: employeeDetail => {
            this.selectedEmployee = employeeDetail;
            this.showEmployeeModal = true;
          },

          error: error => {
            this.errorMessage =
              this.errorHandler.getMessage(error);
          }
        });
  }

  updateEmployee(
    updatedEmployee: EmployeeUpdateModel
  ): void {

    if (!this.selectedEmployee) {
      return;
    }

    const employeeId = this.selectedEmployee.id;

    const employeeToUpdate: EmployeeUpdateModel = {
      id: employeeId,
      ...updatedEmployee
    };

    this.employeeService
      .updateEmployee(employeeToUpdate)
      .subscribe({
        next: updatedEmployeeResponse => {
          const updatedIndex =
            this.employees.findIndex(
              employee => employee.id === employeeId
            );

          if (updatedIndex !== -1) {
            this.employees[updatedIndex] = {
              ...this.employees[updatedIndex],
              ...updatedEmployeeResponse
            };
          }

          this.closeEmployeeModal();
        },

        error: error => {
          this.errorMessage =
            this.errorHandler.getMessage(error);
        }
      });
  }

  closeEmployeeModal(): void {
    this.showEmployeeModal = false;
    this.selectedEmployee = undefined;
  }

  saveEmployee(
    employee: EmployeeCreateModel
  ): void {

    this.subscriptions.add(
      this.employeeService
        .createEmployee(employee)
        .subscribe({
          next: response => {
            const newEmployee: EmployeeModel = {
              id: response.id,
              name: response.name,
              email: response.email,
              phone: response.phone,
              dni: employee.dni,
              role: response.role,
              active: true
            };

            this.employees.push(newEmployee);
            this.closeEmployeeModal();
          },

          error: error => {
            this.errorMessage =
              this.errorHandler.getMessage(error);
          }
        })
    );
  }

  resetPin(
    employee: EmployeeModel
  ): void {

    this.selectedEmployeeForPin = employee;
    this.newPin = '';
    this.confirmPin = '';
    this.pinError = '';
    this.savingPin = false;
    this.showPinModal = true;
  }

  confirmResetPin(event: {
    pin: string;
    confirmPin: string;
  }): void {

    if (!this.selectedEmployeeForPin) {
      return;
    }

    this.savingPin = true;

    this.subscriptions.add(
      this.employeeService
        .resetPin(
          this.selectedEmployeeForPin.id,
          event.pin
        )
        .subscribe({
          next: () => {
            this.savingPin = false;
            this.closePinModal();
          },

          error: error => {
            this.savingPin = false;
            this.pinError =
              this.errorHandler.getMessage(error);
          }
        })
    );
  }

  closePinModal(): void {
    this.showPinModal = false;
    this.selectedEmployeeForPin = undefined;
    this.newPin = '';
    this.confirmPin = '';
    this.pinError = '';
    this.savingPin = false;
  }

  toggleEmployeeStatus(
    employee: EmployeeModel
  ): void {

    if (!employee.active) {
      return;
    }

    this.selectedEmployeeForDismiss = employee;
    this.showDismissConfirmation = true;
  }

  closeDismissConfirmation(): void {
    if (this.dismissingEmployee) {
      return;
    }

    this.showDismissConfirmation = false;
    this.selectedEmployeeForDismiss = undefined;
  }

  confirmDismissEmployee(): void {

    if (
      !this.selectedEmployeeForDismiss ||
      this.dismissingEmployee
    ) {
      return;
    }

    this.dismissingEmployee = true;

    this.subscriptions.add(
      this.employeeService
        .dismissEmployee(
          this.selectedEmployeeForDismiss.id
        )
        .subscribe({
          next: () => {
            const employeeId =
              this.selectedEmployeeForDismiss?.id;

            this.employees =
              this.employees.filter(
                employee =>
                  employee.id !== employeeId
              );

            this.dismissingEmployee = false;
            this.showDismissConfirmation = false;
            this.selectedEmployeeForDismiss = undefined;
          },

          error: error => {
            this.dismissingEmployee = false;
            this.errorMessage =
              this.errorHandler.getMessage(error);
          }
        })
    );
  }

  openHistory(): void {
    this.showingHistory = true;
    this.loadingHistory = true;
    this.errorMessage = '';

    this.subscriptions.add(
      this.employeeService
        .getAllStaff()
        .subscribe({
          next: employees => {
            this.historyEmployees =
              employees.filter(
                employee => !employee.active
              );

            this.loadingHistory = false;
          },

          error: error => {
            this.errorMessage =
              this.errorHandler.getMessage(error);

            this.loadingHistory = false;
          }
        })
    );
  }

  closeHistory(): void {
    this.showingHistory = false;
    this.searchTerm = '';
    this.loadEmployees();
  }

  openRehireConfirmation(
    employee: EmployeeModel
  ): void {
    this.selectedEmployeeForRehire = employee;
    this.showRehireConfirmation = true;
  }

  closeRehireConfirmation(): void {
    if (this.rehiringEmployee) {
      return;
    }

    this.showRehireConfirmation = false;
    this.selectedEmployeeForRehire = undefined;
  }

  confirmRehireEmployee(): void {

    if (
      !this.selectedEmployeeForRehire ||
      this.rehiringEmployee
    ) {
      return;
    }

    this.rehiringEmployee = true;

    this.subscriptions.add(
      this.employeeService
        .rehireEmployee(
          this.selectedEmployeeForRehire.id
        )
        .subscribe({
          next: () => {
            const employeeId =
              this.selectedEmployeeForRehire?.id;

            this.historyEmployees =
              this.historyEmployees.filter(
                employee =>
                  employee.id !== employeeId
              );

            this.rehiringEmployee = false;
            this.showRehireConfirmation = false;
            this.selectedEmployeeForRehire = undefined;
          },

          error: error => {
            this.rehiringEmployee = false;
            this.errorMessage =
              this.errorHandler.getMessage(error);
          }
        })
    );
  }
}
