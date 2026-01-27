import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { GruposResponses, Pagination } from '@core/interfaces';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
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
}
