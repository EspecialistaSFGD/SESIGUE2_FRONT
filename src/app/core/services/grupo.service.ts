import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { GrupoResponse, GrupoResponses, GruposResponses, Pagination } from '@core/interfaces';
import { environment } from '@environments/environment';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root'
})
export class GrupoService {
  private urlGrupo: string = `${environment.api}/Grupo`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService)

  listarGrupos(pagination: Pagination): Observable<GruposResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<GruposResponses>(`${this.urlGrupo}/ListarGrupos`, { headers, params })
  }

  actualizarGrupo(grupo: GrupoResponse) {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.put<GrupoResponses>(`${this.urlGrupo}/ActualizarGrupo/${grupo.grupoID}`, grupo, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }
}
