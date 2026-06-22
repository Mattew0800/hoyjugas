import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take, switchMap } from 'rxjs';
import {AuthService} from '../services/AuthService/auth-service';
import { of } from 'rxjs';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    switchMap(user => {
      if (user) {
        router.navigate(['/home']);
        return of(false);
      }
      // No user in memory, check backend session
      return authService.checkBackendSession().pipe(
        map(backendUser => {
          if (backendUser) {
            router.navigate(['/home']);
            return false;
          }
          return true;
        })
      );
    })
  );
};
