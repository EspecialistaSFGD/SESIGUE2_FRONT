import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Pagination } from '@core/interfaces';
import { EventoDiaResponse, EventoDiasResponses } from '@core/interfaces/evento-dias.interface';
import { catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventoDiasService {
  private urlEventoDia: string = `${environment.api}/EventoDia`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService)

  ListarEventoDias(pagination: Pagination) {
    let params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<EventoDiasResponses>(`${this.urlEventoDia}/ListarEventoDias/${pagination.eventoId}`, { headers, params })
  }

  registrarEventoDia(eventoDia: EventoDiaResponse) {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.post<EventoDiaResponse>(`${this.urlEventoDia}/RegistrarEventoDia`, eventoDia, { headers })
      .pipe(
        tap(resp => resp),
        map(valid => valid),
        catchError(err => of(err))
      )
  }

  actualizarEventoDia(eventoDia: EventoDiaResponse) {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.put<EventoDiaResponse>(`${this.urlEventoDia}/ActualizarEventoDia/${eventoDia.eventoDiaId}`, eventoDia, { headers })
      .pipe(
        tap(resp => resp),
        map(valid => valid),
        catchError(err => of(err))
      )
  }
}
