import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { AsistenciaTecnicaAgendaResponse, AsistenciaTecnicaAgendasResponses } from '@interfaces/asistencia-tecnica-agenda';
import { catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaTecnicaAgendasService {
  private urlAsistenciaTecnicaParticipante: string = `${environment.api}/AsistenciaTecnicaAgenda`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  registrarAgenda(agenda: AsistenciaTecnicaAgendaResponse) {
    agenda.estado = true

    const headers = this.helpersServices.getAutorizationToken()
    return this.http.post<AsistenciaTecnicaAgendasResponses>(`${this.urlAsistenciaTecnicaParticipante}/RegistrarAgenda`, agenda, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid.success),
        catchError(err => of(err))
      )
  }
}
