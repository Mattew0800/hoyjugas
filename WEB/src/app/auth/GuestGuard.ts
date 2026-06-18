import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import {AuthService} from '../services/AuthService/auth-service';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (user) {
        router.navigate(['/home']);
        return false; // Bloquea el acceso a la ruta actual (Login/Onboarding)
      }
      return true;
    })
  );
};
