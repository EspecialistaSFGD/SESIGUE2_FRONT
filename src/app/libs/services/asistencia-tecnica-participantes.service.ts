import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Pagination } from '@interfaces/pagination.interface';
import { AsistenciaTecnicaParticipanteResponse, AsistenciaTecnicaParticipantesResponses } from '@interfaces/asistencia-tecnica-participante';
import { catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaTecnicaParticipantesService {
  private urlAsistenciaTecnicaParticipante: string = `${environment.api}/AsistenciaTecnicaParticipante`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

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
}
