import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EventoResponse, EventoResponses, EventosResponses, ExportResponses, Pagination } from '@core/interfaces';
import { environment } from '@environments/environment';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private urlEvento: string = `${environment.api}/Evento`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  ListarEventos(pagination: Pagination) {
    let params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<EventosResponses>(`${this.urlEvento}/ListarEventos`, { headers, params })
  }

  obtenerEvento(eventoId: string): Observable<EventoResponses> {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<EventoResponses>(`${this.urlEvento}/ObtenerEvento/${eventoId}`, { headers })
  }

  registrarEvento(evento: EventoResponse) {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.post<EventoResponses>(`${this.urlEvento}/RegistrarEvento`, evento, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }

  actualizarEvento(evento: EventoResponse) {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.put<EventoResponses>(`${this.urlEvento}/ActualizarEvento/${evento.eventoId}`, evento, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }

  eliminarEvento(eventoId: string) {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.delete<EventoResponses>(`${this.urlEvento}/EliminarEvento/${eventoId}`, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }

  reporteEventos(pagination: Pagination, estados: string[] = [], tipoEspacioId: string[] = []) {
    let params = this.helpersServices.setParams(pagination)
    for (let estado of estados) {
      params = params.append('estado[]', `${estado}`);
    }
    for (let tipo of tipoEspacioId) {
      params = params.append('tipoEvento[]', `${tipo}`);
    }
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<ExportResponses>(`${this.urlEvento}/ReporteEventos`, { headers, params })
  }

  getAllEventos(codigoTipoEvento: number[] | null = null, estado: number = 1, vigentes: number[] = [1, 2, 3], pagination: Pagination) {
    const sort = pagination.typeSort == 'desc' ? 'descend' : 'ascend'
    let params = new HttpParams()
      .append('estado', `${estado}`)
      .append('piCurrentPage', `${pagination.currentPage}`)
      .append('piPageSize', `${pagination.pageSize}`)
      .append('columnSort', `${pagination.columnSort}`)
      .append('typeSort', `${sort}`);

    for (let vigente of vigentes) {
      params = params.append('vigentes[]', `${vigente}`);
    }

    if (codigoTipoEvento != null) {
      for (let tipo of codigoTipoEvento) {
        params = params.append('codigoTipoEvento[]', `${tipo}`);
      }
    }

    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<EventosResponses>(`${this.urlEvento}/ListarEvento`, { params, headers })
  }
}
