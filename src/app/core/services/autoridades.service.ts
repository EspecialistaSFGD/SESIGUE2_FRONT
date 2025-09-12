import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AutoridadResponse, AutoridadResponses } from '@core/interfaces/autoridad.interface';
import { environment } from '@environments/environment';
import { catchError, map, of, tap } from 'rxjs';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root'
})
export class AutoridadesService {
  private urlAutoridades: string = `${environment.api}/Autoridad`
    
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  registarAutoridad(autoridad: AutoridadResponse) {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.post<AutoridadResponses>(`${this.urlAutoridades}/RegistrarAutoridad`, autoridad, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }

  actualizarAutoridad(autoridad: AutoridadResponse){
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.put<AutoridadResponses>(`${this.urlAutoridades}/ActualizarAutoridad/${autoridad.autoridadId}`, autoridad, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }
}
