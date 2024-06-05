import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { tap } from 'rxjs';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.validarToken()
    .pipe(
      tap(estaAutenticado => {
        if (!estaAutenticado) {
          router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        }
      })
    );
};
