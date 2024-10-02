import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Pagination } from '@interfaces/pagination.interface';
import { ClasificacionesResponses } from '@interfaces/clasificaciones.interface';

@Injectable({
  providedIn: 'root'
})
export class ClasificacionesService {
  private urlClasificaciones: string = `${environment.api}/Clasificacion`

  private http = inject(HttpClient)
  private helpersService = inject(HelpersService);

  getAllClasificaciones(pagination:Pagination){    
    const params = this.helpersService.setParams(pagination)
    const headers = this.helpersService.getAutorizationToken()
    return this.http.get<ClasificacionesResponses>(`${this.urlClasificaciones}/ListarClasificaciones`, { headers, params })
  }
}
