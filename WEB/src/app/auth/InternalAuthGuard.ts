import { AuthService } from '../services/AuthService/auth-service';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { switchMap, map, of, take } from 'rxjs';

export const internalAuthGuard: CanActivateFn = (route) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as string[] | undefined;

  return authService.currentUser$.pipe(

    take(1),

    switchMap(user => {

      if (user) {

        if (
          allowedRoles &&
          (!user.role || !allowedRoles.includes(user.role))
        ) {
          return of(
            router.createUrlTree(['/internal'])
          );
        }

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

          if (!backendUser) {
            return router.createUrlTree(['/internal/login']);
          }

          if (
            allowedRoles &&
            (!backendUser.role ||
              !allowedRoles.includes(backendUser.role))
          ) {
            return router.createUrlTree(['/internal']);
          }

          if (
            backendUser.role === 'ADMIN' ||
            backendUser.role === 'EMPLOYEE'
          ) {
            return true;
          }

          return router.createUrlTree(['/internal/login']);

        })

      );

    })

  );

};
