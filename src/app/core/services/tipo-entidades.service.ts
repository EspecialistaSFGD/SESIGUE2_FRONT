import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Pagination } from '@core/interfaces/pagination.interface';
import { Observable } from 'rxjs';
import { TipoEntidadesResponses } from '@core/interfaces/tipo-entidad.interface';

@Injectable({
  providedIn: 'root'
})
export class TipoEntidadesService {
  private urlTipoEntidad: string = `${environment.api}/TipoEntidad`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  getAllTipoEntidades(pagination: Pagination): Observable<TipoEntidadesResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<TipoEntidadesResponses>(`${this.urlTipoEntidad}/ListarTipoEntidades`, { headers, params })
  }
}
