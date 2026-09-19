import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { ErrorHandlerService } from '../services/ErrorHandlerService/error-handler.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandler = inject(ErrorHandlerService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      if (
        error.status === 401 &&
        !req.url.endsWith('/login')
      ) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.clear();

        router.navigate(['/sign-in']);
      }

      if (error.status === 403) {
        console.error('Acceso denegado:', req.url);
      }

      if (error.status === 0) {
        console.error('Error de conexión:', req.url);
      }

      if (error.status >= 500) {
        console.error(
          'Error del servidor:',
          req.url,
          error.status
        );
      }

      const message = errorHandler.getMessage(error);

      console.error('HTTP Error:', {
        status: error.status,
        url: req.url,
        message
      });

      return throwError(() => error);
    })
  );
};
