import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  getMessage(error: unknown): string {
    if (!error) {
      return 'Ocurrió un error inesperado.';
    }

    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'No se pudo conectar con el servidor. Verificá tu conexión a internet.';
      }

      if (error.status === 400) {
        return this.getBackendMessage(
          error,
          'La solicitud no es válida.'
        );
      }

      if (error.status === 401) {
        return 'Tu sesión expiró. Volvé a iniciar sesión.';
      }

      if (error.status === 403) {
        return 'No tenés permisos para realizar esta acción.';
      }

      if (error.status === 404) {
        return this.getBackendMessage(
          error,
          'No se encontró el recurso solicitado.'
        );
      }

      if (error.status === 409) {
        return this.getBackendMessage(
          error,
          'La operación no se puede realizar porque existe un conflicto.'
        );
      }

      if (error.status === 422) {
        return this.getBackendMessage(
          error,
          'Los datos enviados no son válidos.'
        );
      }

      if (error.status >= 500) {
        return 'Ocurrió un error en el servidor. Intentá nuevamente más tarde.';
      }

      return this.getBackendMessage(
        error,
        'Ocurrió un error inesperado.'
      );
    }

    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    if (
      typeof error === 'object' && 'message' in error && typeof error.message === 'string' &&
      error.message.trim()
    ) {
      return error.message;
    }

    return 'Ocurrió un error inesperado.';
  }

  private getBackendMessage(
    error: HttpErrorResponse,
    fallback: string
  ): string {
    if (
      typeof error.error === 'string' &&
      error.error.trim()
    ) {
      return error.error;
    }

    if (
      error.error &&
      typeof error.error === 'object' &&
      typeof error.error.message === 'string' &&
      error.error.message.trim()
    ) {
      return error.error.message;
    }

    return fallback;
  }
}
