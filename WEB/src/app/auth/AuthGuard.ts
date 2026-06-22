import {AuthService} from '../services/AuthService/auth-service';
import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {switchMap, map, of, take} from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    switchMap(user => {
      if (user) {
        return of(true);
      }
      // No user in memory, check backend session
      return authService.checkBackendSession().pipe(
        map(backendUser => {
          if (backendUser) {
            // Session exists, allow access
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
