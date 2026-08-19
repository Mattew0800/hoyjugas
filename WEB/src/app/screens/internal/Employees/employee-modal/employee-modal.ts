import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';


export interface EmployeeModel {

  id: number;

  name: string;

  email: string;

  phone: string;

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


  name = '';

  email = '';

  phone = '';

  dni = '';


  password = '';

  confirmPassword = '';


  passwordError = '';

  active=true;


  ngOnInit(): void {

    if (this.employee) {

      this.name = this.employee.name;

      this.email = this.employee.email;

      this.phone = this.employee.phone;
      this.active=this.employee.active;
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


    // =========================
    // VALIDACIONES GENERALES
    // =========================

    if (
      !this.name.trim() ||
      !this.email.trim() ||
      !this.phone.trim()
    ) {

      return;

    }


    // =========================
    // CREACIÓN
    // =========================

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


    // =========================
    // EDICIÓN
    // =========================

    /*
     * Por ahora el endpoint de edición
     * todavía no está conectado.
     *
     * Por eso no emitimos EmployeeCreateModel
     * cuando estamos editando.
     */

  }


  closeModal(): void {

    this.close.emit();

  }

}
