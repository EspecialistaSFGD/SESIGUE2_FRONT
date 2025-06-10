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
export class MesaIntegrantesService {
  private urlMesaIntegrante: string = `${environment.api}/MesaIntegrante`
    private http = inject(HttpClient)
    private helpersServices = inject(HelpersService);
  
    ListarMesaIntegrantes(mesaId: string, pagination: Pagination): Observable<MesaIntegrantesResponses> {
      let params = this.helpersServices.setParams(pagination)
      params = params.append('mesaId', mesaId)
      const headers = this.helpersServices.getAutorizationToken()
      return this.http.get<MesaIntegrantesResponses>(`${this.urlMesaIntegrante}/ListarMesaIntegrantes`, { headers, params })
    }
  
    registarMesaIntegrante(mesaId:string, mesaIntegrante: MesaIntegranteResponse) {
      mesaIntegrante.mesaId = mesaId      
    const headers = this.helpersServices.getAutorizationToken()        
    return this.http.post<MesaIntegrantesResponses>(`${this.urlMesaIntegrante}/CrearMesaIntegrante`, mesaIntegrante, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
    }

    actualizarMesaIntegrante(mesaIntegrante: MesaIntegranteResponse){
        const headers = this.helpersServices.getAutorizationToken()  
        return this.http.put<MesaIntegranteResponse>(`${this.urlMesaIntegrante}/ActualizarMesaIntegrante/${mesaIntegrante.mesaIntegranteId}`, mesaIntegrante, { headers })
          .pipe(
            tap(resp => {
              return resp
            }),
            map(valid => valid),
            catchError(err => of(err))
          )
      }
  
    eliminarMesaIntegrante(integranteId: string) {
      const headers = this.helpersServices.getAutorizationToken()
      return this.http.delete<MesaIntegrantesResponses>(`${this.urlMesaIntegrante}/EliminarMesaIntegrante/${integranteId}`, { headers })
        .pipe(
          tap(resp => {
            return resp
          }),
          map(valid => valid),
          catchError(err => of(err))
        )
    }
}
