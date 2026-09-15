import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  EmployeeUpdateModel
} from '../../models/employee-modal';


export interface EmployeeModel {

  id: number;

  name: string;

  email: string;

  phone: string;

  dni: string;

  role: string;

  active: boolean;

}


export interface EmployeeCreateModel {

  name: string;

  email: string;

  password: string;

  dni: string;

  phone: string;

}


@Component({
  selector: 'app-employee-modal',

  standalone: true,

  imports: [
    FormsModule
  ],

  templateUrl: './employee-modal.html',

  styleUrl: './employee-modal.scss'
})
export class EmployeeModal implements OnInit {


  @Input()
  employee?: EmployeeModel;


  @Output()
  close = new EventEmitter<void>();


  @Output()
  saveEmployee =
    new EventEmitter<EmployeeCreateModel>();


  @Output()
  updateEmployee =
    new EventEmitter<EmployeeUpdateModel>();


  name = '';

  email = '';

  phone = '';

  dni = '';

  password = '';

  confirmPassword = '';

  passwordError = '';

  active = true;


  ngOnInit(): void {

    if (this.employee) {

      this.name = this.employee.name;

      this.email = this.employee.email;

      this.phone = this.employee.phone;

      this.dni = this.employee.dni;

      this.active = this.employee.active;

    }

  }


  get isEditing(): boolean {

    return !!this.employee;

  }


  get title(): string {

    return this.isEditing
      ? 'Editar empleado'
      : 'Nuevo empleado';

  }


  get buttonText(): string {

    return this.isEditing
      ? 'Guardar cambios'
      : 'Crear empleado';

  }


  save(): void {

    this.passwordError = '';


    if (
      !this.name.trim() ||
      !this.email.trim() ||
      !this.phone.trim()
    ) {

      return;

    }


    if (!this.isEditing) {

      if (!this.dni.trim()) {

        return;

      }



      if (!this.password.trim()) {

        this.passwordError =
          'La contraseña es obligatoria.';

        return;

      }


      if (!this.confirmPassword.trim()) {

        this.passwordError =
          'Debés confirmar la contraseña.';

        return;

      }


      if (this.password !== this.confirmPassword) {

        this.passwordError =
          'Las contraseñas no coinciden.';

        return;

      }


      const employee: EmployeeCreateModel = {

        name: this.name.trim(),

        email: this.email.trim(),

        password: this.password,

        dni: this.dni.trim(),

        phone: this.phone.trim()

      };


      this.saveEmployee.emit(employee);

      return;

    }


    if (!this.dni.trim()) {

      return;

    }


    if (
      this.password.trim() ||
      this.confirmPassword.trim()
    ) {

      if (!this.password.trim()) {

        this.passwordError =
          'Ingresá la nueva contraseña.';

        return;

      }


      if (this.password.trim().length < 6) {

        this.passwordError =
          'La contraseña debe tener al menos 6 caracteres.';

        return;

      }


      if (!this.confirmPassword.trim()) {

        this.passwordError =
          'Debés confirmar la nueva contraseña.';

        return;

      }


      if (this.password !== this.confirmPassword) {

        this.passwordError =
          'Las contraseñas no coinciden.';

        return;

      }

    }


    const updatedEmployee: EmployeeUpdateModel = {

      name: this.name.trim(),

      email: this.email.trim(),

      phone: this.phone.trim(),

      dni: this.dni.trim()

    };


    if (this.password.trim()) {

      updatedEmployee.password =
        this.password;

    }


    this.updateEmployee.emit(updatedEmployee);

  }


  closeModal(): void {

    this.close.emit();

  }

}
