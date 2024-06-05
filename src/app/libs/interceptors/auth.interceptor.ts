import { HttpErrorResponse, HttpHandler, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(AuthService);
  let isRefreshing = false;
  let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  let authReq = req;
  const token = tokenService.obtenerToken();

  if (token != null) {
    authReq = addTokenHeader(req, token);
  }

  return next(authReq).pipe(catchError(error => {
    if (error instanceof HttpErrorResponse && !authReq.url.includes('login') && error.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        const token = tokenService.obtenerToken();
        const refresh = tokenService.obtenerRefreshToken();

        if (refresh && token) {
          return tokenService.renovarAutenticacion(token, refresh).pipe(
            switchMap((resp: any) => {
              isRefreshing = false;

              //tokenService.guardarLocalStorage(resp.data.token, resp.data.refreshToken);
              refreshTokenSubject.next(resp.data.token);

              return next(addTokenHeader(authReq, resp.data.token));
            }),
            catchError((err) => {
              isRefreshing = false;

              tokenService.logout();
              return throwError(() => err);
            })
          );
        }
      }
    }

    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => next(addTokenHeader(authReq, token)))
    );
  }));
};

const addTokenHeader = (request: HttpRequest<any>, token: string) =>
  request.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
