import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Pagination, ParametroResponse, ParametroResponses, ParametrosResponses } from '@core/interfaces';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParametrosService {
  private urlParametros: string = `${environment.api}/Parametro`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  listarParametros(pagination: Pagination) {
    let params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<ParametrosResponses>(`${this.urlParametros}/ListarParametros`, { headers, params })
  }

  registrarParametro(parametro: ParametroResponse) {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.post<ParametroResponses>(`${this.urlParametros}/RegistrarParametro`, parametro, { headers })
      .pipe(
        tap(resp => resp),
        map(valid => valid),
        catchError(err => of(err))
      )
  }

  actualizarParametro(parametro: ParametroResponse) {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.put<ParametroResponses>(`${this.urlParametros}/ActualizarParametro/${parametro.parametroId}`, parametro, { headers })
      .pipe(
        tap(resp => resp),
        map(valid => valid),
        catchError(err => of(err))
      )
  }
}
