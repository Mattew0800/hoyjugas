import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { InternalHeader } from '../../components/internal-header/internal-header';

import {
  EmployeeModal,
  EmployeeModel,
  EmployeeCreateModel
} from '../employee-modal/employee-modal';

import { EmployeeService } from '../../../../services/EmployeeService/employee-service';
import {PinModal} from '../pin-modal/pin-modal';


@Component({
  selector: 'app-employees-screen',
  standalone: true,

  imports: [
    FormsModule,
    InternalHeader,
    EmployeeModal,
    PinModal
  ],

  templateUrl: './employees-screen.html',

  styleUrl: './employees-screen.scss'
})
export class EmployeesScreen implements OnInit {


  constructor(
    private employeeService: EmployeeService
  ) {}


  searchTerm = '';


  showEmployeeModal = false;

  selectedEmployee?: EmployeeModel;


  employees: EmployeeModel[] = [];

  loadingEmployees = false;

  errorMessage = '';



  showPinModal = false;

  selectedEmployeeForPin?: EmployeeModel;

  newPin = '';

  confirmPin = '';

  pinError = '';

  savingPin = false;


  ngOnInit(): void {

    this.loadEmployees();

  }


  loadEmployees(): void {

    this.loadingEmployees = true;

    this.errorMessage = '';


    this.employeeService
      .getActiveStaff()
      .subscribe({

        next: employees => {

          console.log(
            'PERSONAL ACTIVO:',
            employees
          );

          this.employees = employees;

          this.loadingEmployees = false;

        },


        error: error => {

          console.error(
            'ERROR AL CARGAR PERSONAL:',
            error
          );

          this.errorMessage =
            'No se pudo cargar el personal.';

          this.loadingEmployees = false;

        }

      });

  }



  get filteredEmployees(): EmployeeModel[] {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    if (!search) {

      return this.employees;

    }


    return this.employees.filter(employee =>

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

    this.selectedEmployee = {
      ...employee
    };

    this.showEmployeeModal = true;

  }


  closeEmployeeModal(): void {

    this.showEmployeeModal = false;

    this.selectedEmployee = undefined;

  }

  saveEmployee(
    employee: EmployeeCreateModel
  ): void {

    console.log(
      'CREANDO EMPLEADO:',
      employee
    );


    this.employeeService
      .createEmployee(employee)
      .subscribe({

        next: response => {

          console.log(
            'EMPLEADO CREADO:',
            response
          );


          const newEmployee: EmployeeModel = {

            id: response.id,

            name: response.name,

            email: response.email,

            phone: response.phone,

            role: response.role,

            active: true

          };


          this.employees.push(
            newEmployee
          );


          this.closeEmployeeModal();

        },


        error: error => {

          console.error(
            'ERROR AL CREAR EMPLEADO:',
            error
          );

        }

      });

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

    this.employeeService
      .resetPin(
        this.selectedEmployeeForPin.id,
        event.pin
      )
      .subscribe({

        next: response => {

          console.log(
            'PIN ACTUALIZADO:',
            response
          );

          this.savingPin = false;

          this.closePinModal();

        },

        error: error => {

          console.error(
            'ERROR AL RESETEAR PIN:',
            error
          );

          this.savingPin = false;

        }

      });

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

      console.log(
        'aun no se permite reactivar empleados:',
        employee.name
      );

      return;

    }


    this.employeeService
      .dismissEmployee(employee.id)
      .subscribe({

        next: response => {

          console.log(
            'EMPLEADO DADO DE BAJA:',
            response
          );


          this.employees =
            this.employees.filter(
              e => e.id !== employee.id
            );

        },


        error: error => {

          console.error(
            'ERROR AL DAR DE BAJA EMPLEADO:',
            error
          );

        }

      });

  }

}
