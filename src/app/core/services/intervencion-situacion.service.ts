import { inject, Injectable } from '@angular/core';
import { IntervencionSituacionesResponses, IntervencionSituacionResponse, intervencionSituacionResponses, Pagination } from '@core/interfaces';
import { environment } from '@environments/environment';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { HelpersService } from './helpers.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class IntervencionSituacionService {
  private urlIntervencionSituacion: string = `${environment.api}/IntervencioSituacion`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);
  
  ListarIntervencionTareaAvances(pagination: Pagination): Observable<IntervencionSituacionesResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<IntervencionSituacionesResponses>(`${this.urlIntervencionSituacion}/ListarIntervencionSituaciones`, { headers, params })
  }

  registarIntervencionTareaAvance(intervencionSituacion: IntervencionSituacionResponse) {
    const headers = this.helpersServices.getAutorizationToken()       
    return this.http.post<intervencionSituacionResponses>(`${this.urlIntervencionSituacion}/RegistrarIntervencionSituacion`, intervencionSituacion, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }
}
