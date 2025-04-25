import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { MesaResponse, MesaResponses, MesasResponses, Pagination } from '@core/interfaces';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MesasService {
  private urlMesas: string = `${environment.api}/Mesa`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  ListarMesas(pagination: Pagination): Observable<MesasResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<MesasResponses>(`${this.urlMesas}/ListarMesas`, { headers, params })
  }

  obtenerMesa(mesaId: string ){
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<MesaResponses>(`${this.urlMesas}/ObtenerMesa/${mesaId}`, { headers })
  }

  registarMesa(mesa: MesaResponse) {
    const headers = this.helpersServices.getAutorizationToken()          
    const formData = this.generateFormData(mesa)
    return this.http.post<MesaResponse>(`${this.urlMesas}/RegistrarMesa`, formData, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }

  private generateFormData(mesa: MesaResponse): FormData {
    const formData = new FormData()
    formData.append('nombre', mesa.nombre)
    formData.append('sectorId', mesa.sectorId)
    formData.append('secretariaTecnicaId', mesa.secretariaTecnicaId)
    formData.append('fechaCreacion', mesa.fechaCreacion)
    formData.append('fechaVigencia', mesa.fechaVigencia)
    formData.append('resolucion', mesa.resolucion)
    return formData
  }
}
