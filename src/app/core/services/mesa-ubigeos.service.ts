import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Pagination } from '@core/interfaces';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { MesaIntegranteResponse, MesaIntegrantesResponses } from '@core/interfaces/mesa-integrantes.interface';

@Injectable({
  providedIn: 'root'
})
export class MesaUbigeosService {
  private urlMesaUbigeo: string = `${environment.api}/MesaUbigeo`
    private http = inject(HttpClient)
    private helpersServices = inject(HelpersService);
  
    ListarMesaIntegrantes(mesaId: string, pagination: Pagination): Observable<MesaIntegrantesResponses> {
      let params = this.helpersServices.setParams(pagination)
      params = params.append('mesaId', mesaId)
      const headers = this.helpersServices.getAutorizationToken()
      return this.http.get<MesaIntegrantesResponses>(`${this.urlMesaUbigeo}/ListarMesaUbigeo`, { headers, params })
    }
  
    registarMesaUbigeo(mesaId:string, mesaIntegrante: MesaIntegranteResponse) {
      mesaIntegrante.mesaId = mesaId      
    const headers = this.helpersServices.getAutorizationToken()        
    return this.http.post<MesaIntegrantesResponses>(`${this.urlMesaUbigeo}/CrearMesaUbigeo`, mesaIntegrante, { headers })
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
      return this.http.delete<MesaIntegrantesResponses>(`${this.urlMesaUbigeo}/EliminarMesaUbigeo/${mesaUbigeoId}`, { headers })
        .pipe(
          tap(resp => {
            return resp
          }),
          map(valid => valid),
          catchError(err => of(err))
        )
    }
}
