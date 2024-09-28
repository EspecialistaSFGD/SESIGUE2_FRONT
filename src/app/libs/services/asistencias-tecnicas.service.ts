import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { AsistenciasTecnicasResponse } from '@interfaces/asistencia-tecnica.interface';
import { Pagination } from '@interfaces/pagination.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsistenciasTecnicasService {

  private urlAsistenciaTecnica: string = `${environment.api}/AsistenciaTecnica`
  private http = inject(HttpClient)

  getAllAsistenciasTecnicas(pagination: Pagination): Observable<AsistenciasTecnicasResponse> {
    const params = this.setParams(pagination)
    const headers = this.getAutorizationToken()
    return this.http.get<AsistenciasTecnicasResponse>(`${this.urlAsistenciaTecnica}/ListarAsistenciasTecnicas`, { headers, params })
  }

  getAutorizationToken() {
    const { codigo, expiracionToken } = JSON.parse(localStorage.getItem('token') || '')
    return new HttpHeaders().set('Autorization', `Bearer ${codigo}`)
  }

  setParams(pagination: Pagination) {
    pagination.code = Number(localStorage.getItem('codigoUsuario')) ?? 0
    let httpParams = new HttpParams();
    const params = Object.entries(pagination).map(([key, value]) => { return { key, value } })
    for (let param of params) {
      httpParams = httpParams.append(param.key, param.value);
    }
    return httpParams
  }
}
