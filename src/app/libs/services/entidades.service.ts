import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Pagination } from '@interfaces/pagination.interface';
import { HelpersService } from './helpers.service';
import { TipoEntidadesResponses } from '@interfaces/entidad.interface';

@Injectable({
  providedIn: 'root'
})
export class EntidadesService {

  private urlTipoEntidades: string = `${environment.api}/TipoEntidad`

  private http = inject(HttpClient)
  private helpersService = inject(HelpersService);

  getAllTipoEntidades(pagination:Pagination){    
    const params = this.helpersService.setParams(pagination)
    const headers = this.helpersService.getAutorizationToken()
    return this.http.get<TipoEntidadesResponses>(`${this.urlTipoEntidades}/ListarTipoEntidades`, { headers, params })
  }
}
