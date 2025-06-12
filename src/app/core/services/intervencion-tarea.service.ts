import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { IntervencionTareaResponse, IntervencionTareaResponses, IntervencionTareasResponses, Pagination } from '@core/interfaces';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IntervencionTareaService {
  private urlIntervencionTarea: string = `${environment.api}/IntervencionTarea`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);
  
  ListarIntervencionTareas(pagination: Pagination): Observable<IntervencionTareasResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<IntervencionTareasResponses>(`${this.urlIntervencionTarea}/ListarIntervencionTareas`, { headers, params })
  }

  obtenerIntervencionTareas(tareaId: string ){
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<IntervencionTareaResponses>(`${this.urlIntervencionTarea}/ObtenerIntervencionTarea/${tareaId}`, { headers })
  }

  registarIntervencionTarea(intervencionTarea: IntervencionTareaResponse) {
      const headers = this.helpersServices.getAutorizationToken()          
      return this.http.post<IntervencionTareaResponse>(`${this.urlIntervencionTarea}/RegistrarIntervencionTarea`, intervencionTarea, { headers })
        .pipe(
          tap(resp => {
            return resp
          }),
          map(valid => valid),
          catchError(err => of(err))
        )
  }

  actualizarIntervencionTarea(intervencionTarea: IntervencionTareaResponse){
      const headers = this.helpersServices.getAutorizationToken()
      return this.http.put<IntervencionTareaResponse>(`${this.urlIntervencionTarea}/ActualizarIntervencionTarea/${intervencionTarea.intervencionTareaId}`, intervencionTarea, { headers })
        .pipe(
          tap(resp => {
            return resp
          }),
          map(valid => valid),
          catchError(err => of(err))
        )
    }

    eliminarIntervencionTarea(tareaId: string) {
        const headers = this.helpersServices.getAutorizationToken()
        return this.http.delete<IntervencionTareasResponses>(`${this.urlIntervencionTarea}/EliminarIntervencionTarea/${tareaId}`, { headers })
          .pipe(
            tap(resp => {
              return resp
            }),
            map(valid => valid),
            catchError(err => of(err))
          )
      }
}
