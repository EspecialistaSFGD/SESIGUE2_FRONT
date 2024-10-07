import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { AsistenciasTecnicasResponse } from '@interfaces/asistencia-tecnica.interface';
import { Pagination } from '@interfaces/pagination.interface';
import { Observable } from 'rxjs';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root'
})
export class AsistenciasTecnicasService {

  private urlAsistenciaTecnica: string = `${environment.api}/AsistenciaTecnica`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  getAllAsistenciasTecnicas(pagination: Pagination): Observable<AsistenciasTecnicasResponse> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<AsistenciasTecnicasResponse>(`${this.urlAsistenciaTecnica}/ListarAsistenciasTecnicas`, { headers, params })
  }
}
