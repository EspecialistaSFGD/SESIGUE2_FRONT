import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Pagination } from '@core/interfaces';
import { EntidadResponses, EntidadesResponses } from '@core/interfaces/entidad.interface';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root'
})
export class EntidadesService {
  private urlEntidad: string = `${environment.api}/Entidad`

  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);


  listarEntidades(pagination: Pagination, subTipos: string[] = []): Observable<EntidadesResponses> {
    let params = this.helpersServices.setParams(pagination)
    for(let subTipo of subTipos){
      params = params.append('subTipos[]', subTipo)
    }
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<EntidadesResponses>(`${this.urlEntidad}/ListarEntidades`, { headers, params })
  }

  obtenerEntidad(pagination: Pagination): Observable<EntidadResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<EntidadResponses>(`${this.urlEntidad}/ObtenerEntidad`, { headers, params })
  }

  getEntidadPorUbigeo(ubigeo: string): Observable<EntidadResponses> {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<EntidadResponses>(`${this.urlEntidad}/ListarPorUbigeo/${ubigeo}`, { headers })
  }

  getEntidadPorId(id: string): Observable<EntidadesResponses> {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<EntidadesResponses>(`${this.urlEntidad}/ListarPorId/${id}`, { headers })
  }

  getMancomunidades(tipo:string, pagination:Pagination): Observable<EntidadesResponses>{
    let params = this.helpersServices.setParams(pagination)
    params = params.append('tipo', tipo) 
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<EntidadesResponses>(`${this.urlEntidad}/ListarMancomunidades`, { headers, params })
  }
}
