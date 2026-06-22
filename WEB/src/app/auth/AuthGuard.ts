import {AuthService} from '../services/AuthService/auth-service';
import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {map, of, switchMap, take} from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    switchMap(user => {
      if (user) {
        return of(true);
      }

      return authService.checkBackendSession().pipe(
        map(backendUser => {
          if (backendUser) {
            return true;
          } else {
            router.navigate(['/sign-in']);
            return false;
          }
        })
      );
    })
  );
};
