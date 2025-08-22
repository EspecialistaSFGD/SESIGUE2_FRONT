import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { PaginationPanel } from '@core/interfaces';
import { HitoResponse, HitoResponses, HitosPanelResponses } from '@core/interfaces/hito.interface';
import { environment } from '@environments/environment';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root'
})
export class HitosService {
  private urlHito: string = `${environment.api}/Hito`

  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  getHitoDashboard(pagination: PaginationPanel): Observable<HitosPanelResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<HitosPanelResponses>(`${this.urlHito}/ReportePanel`, { headers, params })
  }

  actualizarHito(Hito: HitoResponse){
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.put<HitoResponses>(`${this.urlHito}/ActualizarHito/${Hito.hitoId}`, Hito, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }
}
