import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EventosResponses, Pagination } from '@core/interfaces';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private urlEvento: string = `${environment.api}/Evento`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

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

    if (codigoTipoEvento != null){
      for (let tipo of codigoTipoEvento) {
        params = params.append('codigoTipoEvento[]', `${tipo}`);
      }
    }

    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<EventosResponses>(`${this.urlEvento}/ListarEvento`, { params, headers })
  }
}
