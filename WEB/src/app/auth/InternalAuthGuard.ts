import { AuthService } from '../services/AuthService/auth-service';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { switchMap, map, of, take } from 'rxjs';

export const internalAuthGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(

    take(1),

    switchMap(user => {

      if (user) {

        if (
          user.role === 'ADMIN' ||
          user.role === 'EMPLOYEE'
        ) {

          return of(true);

        }

        return of(
          router.createUrlTree(['/internal/login'])
        );

      }
      return authService.checkBackendSession().pipe(

        map(backendUser => {

          if (
            backendUser &&
            (
              backendUser.role === 'ADMIN' ||
              backendUser.role === 'EMPLOYEE'
            )
          ) {

            return true;

          }

          return router.createUrlTree(['/internal/login']);

        })

      );

    })

  );

};
