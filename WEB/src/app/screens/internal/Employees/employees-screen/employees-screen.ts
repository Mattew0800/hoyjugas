import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { InternalHeader } from '../../components/internal-header/internal-header';

import {EmployeeModal,EmployeeModel,EmployeeCreateModel} from '../employee-modal/employee-modal';
import {EmployeeService} from '../../../../services/EmployeeService/employee-srevice';

@Component({
  selector: 'app-employees-screen',
  standalone: true,
  imports: [
    FormsModule,
    InternalHeader,
    EmployeeModal
  ],
  templateUrl: './employees-screen.html',
  styleUrl: './employees-screen.scss'
})
export class EmployeesScreen {

  constructor(
    private employeeService: EmployeeService
  ) {}

  // =========================
  // BUSCADOR
  // =========================

  searchTerm = '';

  // =========================
  // MODAL
  // =========================

  showEmployeeModal = false;

  selectedEmployee?: EmployeeModel;

  // =========================
  // EMPLEADOS
  // =========================

  employees: EmployeeModel[] = [

    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan.perez@gmail.com',
      phone: '2235123456',
      dni: '40123456',
      enabled: true
    },

    {
      id: 2,
      name: 'Martín López',
      email: 'martin.lopez@gmail.com',
      phone: '2234987654',
      dni: '39876543',
      enabled: true
    },

    {
      id: 3,
      name: 'Pedro González',
      email: 'pedro.gonzalez@gmail.com',
      phone: '2234567890',
      dni: '41234567',
      enabled: false
    }

  ];

  // =========================
  // EMPLEADOS FILTRADOS
  // =========================

  get filteredEmployees(): EmployeeModel[] {

    const search = this.searchTerm
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

      employee.dni
        .includes(search)

    );

  }

  // =========================
  // NUEVO EMPLEADO
  // =========================

  openNewEmployee(): void {

    this.selectedEmployee = undefined;

    this.showEmployeeModal = true;

  }

  // =========================
  // EDITAR EMPLEADO
  // =========================

  editEmployee(employee: EmployeeModel): void {

    this.selectedEmployee = {
      ...employee
    };

    this.showEmployeeModal = true;

  }

  // =========================
  // CERRAR MODAL
  // =========================

  closeEmployeeModal(): void {

    this.showEmployeeModal = false;

    this.selectedEmployee = undefined;

  }

  // =========================
  // CREAR EMPLEADO
  // =========================

  saveEmployee(employee: EmployeeCreateModel): void {

    console.log('CREANDO EMPLEADO:', employee);

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

            dni: response.dni,

            enabled: true

          };

          this.employees.push(newEmployee);

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

  // =========================
  // CAMBIAR ESTADO
  // =========================

  toggleEmployeeStatus(
    employee: EmployeeModel
  ): void {

    employee.enabled = !employee.enabled;

    console.log(
      employee.enabled
        ? 'Empleado activado'
        : 'Empleado desactivado',
      employee
    );

  }

  // =========================
  // RESET PIN
  // =========================

  resetPin(
    employee: EmployeeModel
  ): void {

    console.log(
      'Resetear PIN de:',
      employee.name
    );

  }

}
