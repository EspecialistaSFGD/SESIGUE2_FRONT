import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Pagination, TipoEventosResponses } from '@core/interfaces';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root'
})
export class TipoEventosService {
  private urlTipoEvento: string = `${environment.api}/TipoEvento`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  getAllTipoEvento(pagination: Pagination): Observable<TipoEventosResponses> {
    const sort = pagination.typeSort == 'desc' ? 'descend' : 'ascend'
    let params = new HttpParams()
      .append('piCurrentPage', `${pagination.currentPage}`)
      .append('piPageSize', `${pagination.pageSize}`)
      .append('columnSort', `${pagination.columnSort}`)
      .append('typeSort', `${sort}`);
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<TipoEventosResponses>(`${this.urlTipoEvento}/Listar`, { headers, params })
  }
}
