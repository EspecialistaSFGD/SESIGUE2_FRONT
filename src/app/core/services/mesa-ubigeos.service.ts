import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Pagination } from '@core/interfaces';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { MesaUbigeoResponse, MesaUbigeosResponses } from '@core/interfaces/mesa-ubigeo.interface';

@Injectable({
  providedIn: 'root'
})
export class MesaUbigeosService {
  private urlMesaUbigeo: string = `${environment.api}/MesaUbigeo`
    private http = inject(HttpClient)
    private helpersServices = inject(HelpersService);
  
    ListarMesas(mesaId: number, pagination: Pagination): Observable<MesaUbigeosResponses> {
      let params = this.helpersServices.setParams(pagination)
      params = params.append('mesaId', mesaId)
      const headers = this.helpersServices.getAutorizationToken()
      return this.http.get<MesaUbigeosResponses>(`${this.urlMesaUbigeo}/ListarMesaUbigeo`, { headers, params })
    }
  
    registarMesaUbigeo(mesaUbigeo: MesaUbigeoResponse) {      
    const headers = this.helpersServices.getAutorizationToken()        
    return this.http.post<MesaUbigeosResponses>(`${this.urlMesaUbigeo}/CrearMesaUbigeo`, mesaUbigeo, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
    }
  
    eliminarMesaUbigeo(mesaUbigeoId: string) {
      const headers = this.helpersServices.getAutorizationToken()
      return this.http.delete<MesaUbigeosResponses>(`${this.urlMesaUbigeo}/EliminarMesaUbigeo/${mesaUbigeoId}`, { headers })
        .pipe(
          tap(resp => {
            return resp
          }),
          map(valid => valid),
          catchError(err => of(err))
        )
    }
}
