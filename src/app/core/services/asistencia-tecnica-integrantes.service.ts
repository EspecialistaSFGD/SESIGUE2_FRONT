import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { HelpersService } from './helpers.service';
import { environment } from '@environments/environment';
import { AsistenciaTecnicaIntegranteResponse, AsistenciaTecnicaIntegranteResponses, AsistenciaTecnicaIntegrantesResponses, Pagination } from '@core/interfaces';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaTecnicaIntegrantesService {
  private urlAsistenciaTecnicaIntegrante: string = `${environment.api}/AsistenciaTecnicaIntegrante`
  
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  ListarAsistenciaTecnicaIntegrantes(asistenciaTecnicaId: string, pagination: Pagination): Observable<AsistenciaTecnicaIntegrantesResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<AsistenciaTecnicaIntegrantesResponses>(`${this.urlAsistenciaTecnicaIntegrante}/ListarIntegrantes/${asistenciaTecnicaId}`, { headers, params })
  }

  registrarIntegrante(integrante: AsistenciaTecnicaIntegranteResponse) {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.post<AsistenciaTecnicaIntegranteResponses>(`${this.urlAsistenciaTecnicaIntegrante}/RegistrarIntegrante`, integrante, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid.success),
        catchError(err => of(err))
      )
  }

  actualizarIntegrante(integrante: AsistenciaTecnicaIntegranteResponse) {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.post<AsistenciaTecnicaIntegranteResponses>(`${this.urlAsistenciaTecnicaIntegrante}/ActualizarIntegrante/${integrante.integranteId}`, integrante, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid.success),
        catchError(err => of(err))
      )
  }

  eliminarIntegrante(asistenteId: string) {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.delete<AsistenciaTecnicaIntegranteResponses>(`${this.urlAsistenciaTecnicaIntegrante}/EliminarIntegrante/${asistenteId}`, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }
}
