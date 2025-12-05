import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { ActividadesResponses, ActividadResponse, ActividadResponses, Pagination } from '@core/interfaces';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActividadesService {
  private urlActividades: string = `${environment.api}/Actividad`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  ListarActividades(pagination: Pagination) {
    let params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<ActividadesResponses>(`${this.urlActividades}/ListarActividades`, { headers, params })
  }

  obtenerActividad(actividadId: string): Observable<ActividadResponses> {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<ActividadResponses>(`${this.urlActividades}/ObtenerActividad/${actividadId}`, { headers })
  }

  registrarActividad(actividad: ActividadResponse) {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.post<ActividadResponses>(`${this.urlActividades}/RegistrarActividad`, actividad, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }

  actualizarActividad(actividad: ActividadResponse) {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.put<ActividadResponses>(`${this.urlActividades}/ActualizarActividad/${actividad.actividadId}`, actividad, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }

  eliminarActividad(actividadId: string) {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.delete<ActividadResponses>(`${this.urlActividades}/EliminarActividad/${actividadId}`, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }
}
