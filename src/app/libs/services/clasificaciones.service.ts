import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Pagination } from '@interfaces/pagination.interface';
import { Observable } from 'rxjs';
import { ClasificacionesResponses } from '@interfaces/clasificacion.interface';

@Injectable({
  providedIn: 'root'
})
export class ClasificacionesService {
  private urlClasificacion: string = `${environment.api}/Clasificacion`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  getAllClasificaciones(pagination: Pagination): Observable<ClasificacionesResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<ClasificacionesResponses>(`${this.urlClasificacion}/ListarClasificaciones`, { headers, params })
  }
}
