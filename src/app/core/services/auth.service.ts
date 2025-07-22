import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { GenerarClaveResponse, GenerarClaveResponses } from '@core/interfaces/auth.interface';
import { environment } from '@environments/environment';
import { catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private urlAuth: string = `${environment.api}/Login`
  private http = inject(HttpClient)

  obtenerOtp(usuario: string) {
    const body = { usuario };
    return this.http.post<GenerarClaveResponses>(`${this.urlAuth}/ObtenerOtp`, body )
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }

  validarOtp(otpData: GenerarClaveResponse) {
    delete otpData.email;
    return this.http.post<GenerarClaveResponses>(`${this.urlAuth}/ValidarOtp`, otpData)
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }
}
