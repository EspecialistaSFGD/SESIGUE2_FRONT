import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { AsistenciaTecnicaAgendaResponse, AsistenciaTecnicaAgendasResponses } from '@core/interfaces/asistencia-tecnica-agenda';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { Pagination } from '@core/interfaces/pagination.interface';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaTecnicaAgendasService {
  private urlAsistenciaTecnicaAgenda: string = `${environment.api}/AsistenciaTecnicaAgenda`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  getAllAgendas(asistenciaId: string, pagination: Pagination): Observable<AsistenciaTecnicaAgendasResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<AsistenciaTecnicaAgendasResponses>(`${this.urlAsistenciaTecnicaAgenda}/ListarAgendas/${asistenciaId}`, { headers, params })
  }

  registrarAgenda(agenda: AsistenciaTecnicaAgendaResponse) {
    agenda.estado = true
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.post<AsistenciaTecnicaAgendasResponses>(`${this.urlAsistenciaTecnicaAgenda}/RegistrarAgenda`, agenda, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid.success),
        catchError(err => of(err))
      )
  }

  actualizarAgenda(agenda: AsistenciaTecnicaAgendaResponse) {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.post<AsistenciaTecnicaAgendasResponses>(`${this.urlAsistenciaTecnicaAgenda}/ActualizarAgenda/${agenda.agendaId}`, agenda, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid.success),
        catchError(err => of(err))
      )
  }

  eliminarAgenda(agendaId: string) {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.delete<AsistenciaTecnicaAgendasResponses>(`${this.urlAsistenciaTecnicaAgenda}/EliminarAgenda/${agendaId}`, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }
}
