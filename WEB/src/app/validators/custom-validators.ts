import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export class CustomValidators {
  /**
   * Valida que un número telefónico sea válido para Argentina
   * Formato esperado: código de área (2-4 dígitos) + número (6-8 dígitos) = 10 dígitos totales
   */
  static argentinePhoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';

      if (!value) {
        return null;
      }

      const cleanPhone = value.replace(/[\s\-()]/g, '');

      // Only numbers allowed
      if (!/^\d+$/.test(cleanPhone)) {
        return { invalidArgentinePhone: { value: value, message: 'Solo se permiten números' } };
      }

      if (cleanPhone.length !== 10) {
        return {
          invalidArgentinePhone: {
            value: value,
            message: 'El teléfono debe tener 10 dígitos. Formato: código de área (2-4 dígitos) + número (6-8 dígitos)'
          }
        };
      }

      return null;
    };
  }

  /**
   * Valida que un DNI sea válido para Argentina
   * Formato esperado: 7-10 dígitos (con o sin puntos)
   */
  static argentineDniValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';

      if (!value) {
        return null;
      }

      // Remove dots and hyphens for validation
      const cleanDni = value.replace(/[.\-\s]/g, '');

      // Only numbers allowed
      if (!/^\d+$/.test(cleanDni)) {
        return { invalidArgentineDni: { value: value, message: 'El DNI solo puede contener números' } };
      }

      // Argentine DNI must be between 7 and 10 digits
      // Format: XX.XXX.XXX or XXXXXXXX (most common is 8 digits)
      // Examples: 12.345.678 or 12345678
      if (cleanDni.length < 7 || cleanDni.length > 10) {
        return {
          invalidArgentineDni: {
            value: value,
            message: 'El DNI debe tener entre 7 y 10 dígitos. Formato: XX.XXX.XXX o XXXXXXXX'
          }
        };
      }

      return null;
    };
  }

  /**
   * Valida que un campo no exceda una cantidad máxima de palabras
   */
  static maxWordsValidator(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';
      const words = value.trim().split(/\s+/).filter((w: string) => w.length > 0);
      return words.length > max ? { maxWords: { requiredMax: max, actual: words.length } } : null;
    };
  }

  /**
   * Valida que dos contraseñas coincidan
   */
  static passwordsMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password')?.value;
      const confirmPassword = control.get('confirmPassword')?.value;

      if (!password || !confirmPassword) {
        return null;
      }

      if (password !== confirmPassword) {
        control.get('confirmPassword')?.setErrors({ passwordsMismatch: true });
        return { passwordsMismatch: true };
      } else {
        // Clear the error if passwords match
        const errors = control.get('confirmPassword')?.errors;
        if (errors) {
          delete errors['passwordsMismatch'];
          if (Object.keys(errors).length === 0) {
            control.get('confirmPassword')?.setErrors(null);
          }
        }
      }

      return null;
    };
  }
}

