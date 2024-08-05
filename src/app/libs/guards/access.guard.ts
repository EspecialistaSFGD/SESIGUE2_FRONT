import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { inject } from '@angular/core';
import { tap } from 'rxjs';

export const AccessGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.canViewPedidos()) {
    router.navigate(['/panel']);
    return false;
  }

  return true;
};
