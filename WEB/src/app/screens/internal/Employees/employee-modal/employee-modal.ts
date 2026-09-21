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

  @Input() saving = false;
  @Input() errorMessage = '';

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

  nameError = '';
  emailError = '';
  phoneError = '';
  dniError = '';
  passwordError = '';
  confirmPasswordError = '';

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
    this.clearErrors();

    if (!this.validateName()) {
      return;
    }

    if (!this.validateEmail()) {
      return;
    }

    if (!this.validatePhone()) {
      return;
    }

    if (!this.validateDni()) {
      return;
    }

    if (!this.validatePassword()) {
      return;
    }

    if (!this.isEditing) {
      this.createEmployee();
      return;
    }

    this.updateEmployeeData();
  }

  private validateName(): boolean {
    const value = this.name.trim();

    if (!value) {
      this.nameError = 'El nombre y apellido son obligatorios.';
      return false;
    }

    const words = value.split(/\s+/).filter(word => word.length > 0);

    if (words.length < 2) {
      this.nameError = 'Ingresá nombre y apellido.';
      return false;
    }

    if (value.length > 100) {
      this.nameError = 'El nombre no puede superar los 100 caracteres.';
      return false;
    }

    const nameRegex = /^\p{L}+$/u;

    if (!words.every(word => nameRegex.test(word))) {
      this.nameError =
        'El nombre y apellido solo pueden contener letras.';
      return false;
    }

    return true;
  }

  private validateEmail(): boolean {
    const value = this.email.trim();

    if (!value) {
      this.emailError = 'El email es obligatorio.';
      return false;
    }

    if (value.length > 254) {
      this.emailError = 'El email no puede superar los 254 caracteres.';
      return false;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value)) {
      this.emailError = 'Ingresá un email válido.';
      return false;
    }

    return true;
  }

  private validatePhone(): boolean {
    const value = this.phone.trim();

    if (!value) {
      this.phoneError = 'El teléfono es obligatorio.';
      return false;
    }

    if (!/^\d+$/.test(value)) {
      this.phoneError = 'El teléfono solo puede contener números.';
      return false;
    }

    if (value.length < 8 || value.length > 15) {
      this.phoneError =
        'El teléfono debe tener entre 8 y 15 números.';
      return false;
    }

    return true;
  }

  private validateDni(): boolean {
    const value = this.dni.trim();

    if (!value) {
      this.dniError = 'El DNI es obligatorio.';
      return false;
    }

    if (!/^\d+$/.test(value)) {
      this.dniError = 'El DNI solo puede contener números.';
      return false;
    }

    if (value.length < 7 || value.length > 8) {
      this.dniError =
        'El DNI debe tener entre 7 y 8 números.';
      return false;
    }

    return true;
  }

  private validatePassword(): boolean {
    const password = this.password.trim();
    const confirmation = this.confirmPassword.trim();

    if (!this.isEditing && !password) {
      this.passwordError =
        'La contraseña es obligatoria.';
      return false;
    }

    if (this.isEditing && !password && !confirmation) {
      return true;
    }

    if (password.length < 6) {
      this.passwordError =
        'La contraseña debe tener al menos 6 caracteres.';
      return false;
    }

    if (!confirmation) {
      this.confirmPasswordError =
        'Debés confirmar la contraseña.';
      return false;
    }

    if (password !== confirmation) {
      this.confirmPasswordError =
        'Las contraseñas no coinciden.';
      return false;
    }

    return true;
  }

  private createEmployee(): void {
    const employee: EmployeeCreateModel = {
      name: this.name.trim(),
      email: this.email.trim(),
      password: this.password.trim(),
      dni: this.dni.trim(),
      phone: this.phone.trim()
    };

    this.saveEmployee.emit(employee);
  }

  private updateEmployeeData(): void {
    const password = this.password.trim();

    const updatedEmployee: EmployeeUpdateModel = {
      name: this.name.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      dni: this.dni.trim()
    };

    if (password) {
      updatedEmployee.password = password;
    }

    this.updateEmployee.emit(updatedEmployee);
  }

  private clearErrors(): void {
    this.nameError = '';
    this.emailError = '';
    this.phoneError = '';
    this.dniError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
  }

  closeModal(): void {
    this.close.emit();
  }
}
