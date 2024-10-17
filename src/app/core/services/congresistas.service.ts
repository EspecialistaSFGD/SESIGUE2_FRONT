import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { CongresistaResponse, CongresistasResponses } from '@core/interfaces/congresista.interface';

@Injectable({
  providedIn: 'root'
})
export class CongresistasService {
  private urlCongresista: string = `${environment.api}/Congresista`

  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  getCongresistaId(id: string): Observable<CongresistasResponses> {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<CongresistasResponses>(`${this.urlCongresista}/CongresistaPorId/${id}`, { headers })
  }

  getCongresistaDNI(dni: string): Observable<CongresistasResponses> {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<CongresistasResponses>(`${this.urlCongresista}/CongresistaPorDni/${dni}`, { headers })
  }

  registrarCongresista(congresista: CongresistaResponse) {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.post<CongresistasResponses>(`${this.urlCongresista}/RegistrarCongresista`, congresista, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }
}
