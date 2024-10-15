import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Pagination } from '@interfaces/pagination.interface';
import { AsistenciaTecnicaParticipanteResponse, AsistenciaTecnicaParticipantesResponses } from '@interfaces/asistencia-tecnica-participante';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaTecnicaParticipantesService {
  private urlAsistenciaTecnicaParticipante: string = `${environment.api}/AsistenciaTecnicaParticipante`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  getAllParticipantes(asistenciaId: string, pagination: Pagination): Observable<AsistenciaTecnicaParticipantesResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<AsistenciaTecnicaParticipantesResponses>(`${this.urlAsistenciaTecnicaParticipante}/ListarParticipantes/${asistenciaId}`, { headers, params })
  }

  registrarParticipante(participante: AsistenciaTecnicaParticipanteResponse) {
    participante.estado = true

    const headers = this.helpersServices.getAutorizationToken()
    return this.http.post<AsistenciaTecnicaParticipantesResponses>(`${this.urlAsistenciaTecnicaParticipante}/RegistrarParticipante`, participante, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid.success),
        catchError(err => of(err))
      )
  }

  actualizarAgenda(participante: AsistenciaTecnicaParticipanteResponse) {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.post<AsistenciaTecnicaParticipantesResponses>(`${this.urlAsistenciaTecnicaParticipante}/ActualizarParticipante/${participante.participanteId}`, participante, { headers })
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
    return this.http.delete<AsistenciaTecnicaParticipantesResponses>(`${this.urlAsistenciaTecnicaParticipante}/EliminarParticipante/${agendaId}`, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }
}
