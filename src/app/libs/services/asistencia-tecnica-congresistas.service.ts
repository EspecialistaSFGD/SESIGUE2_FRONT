import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Pagination } from '@interfaces/pagination.interface';
import { AsistenciaTecnicaCongresistaResponse, AsistenciaTecnicaCongresistasResponses } from '@interfaces/asistencia-tecnica-congresista.interface';
import { Observable, catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaTecnicaCongresistasService {
  private urlAsistenciaTecnicaCongresista: string = `${environment.api}/AsistenciaTecnicaCongresista`

  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  getAllCongresistas(asistenciaId: string, pagination: Pagination): Observable<AsistenciaTecnicaCongresistasResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<AsistenciaTecnicaCongresistasResponses>(`${this.urlAsistenciaTecnicaCongresista}/ListarCongresistas/${asistenciaId}`, { headers, params })
  }

  registrarCongresista(congresista: AsistenciaTecnicaCongresistaResponse) {
    const headers = this.helpersServices.getAutorizationToken()
    const registro = {
      asistenciaId: congresista.asistenciaId,
      congresistaId: congresista.congresistaId
    }
    return this.http.post<AsistenciaTecnicaCongresistasResponses>(`${this.urlAsistenciaTecnicaCongresista}/RegistrarCongresista`, registro, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid.success),
        catchError(err => of(err))
      )
  }

  actualizarCongresista(congresista: AsistenciaTecnicaCongresistaResponse) {
    const headers = this.helpersServices.getAutorizationToken()
    const registro = {
      congresistaId: congresista.congresistaId
    }
    return this.http.post<AsistenciaTecnicaCongresistasResponses>(`${this.urlAsistenciaTecnicaCongresista}/ActualizarCongresista/${congresista.congresistaId}`, registro, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid.success),
        catchError(err => of(err))
      )
  }

  eliminarCongresista(asistenciaId: string) {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.delete<AsistenciaTecnicaCongresistasResponses>(`${this.urlAsistenciaTecnicaCongresista}/EliminarCongresista/${asistenciaId}`, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid.success),
        catchError(err => of(err))
      )
  }
}
