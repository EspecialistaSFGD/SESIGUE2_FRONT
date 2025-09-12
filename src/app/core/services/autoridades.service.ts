import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Pagination } from '@core/interfaces';
import { AutoridadesResponses, AutoridadResponse, AutoridadResponses } from '@core/interfaces/autoridad.interface';
import { environment } from '@environments/environment';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root'
})
export class AutoridadesService {
  private urlAutoridades: string = `${environment.api}/Autoridad`
    
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  listarAutoridad(pagination: Pagination): Observable<AutoridadesResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<AutoridadesResponses>(`${this.urlAutoridades}/ListarAutoridades`, { headers, params })
  }

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
