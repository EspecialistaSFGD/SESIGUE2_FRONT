import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { MesaDetalleResponse, MesaDetallesResponses, Pagination } from '@core/interfaces';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MesaDetallesService {
  private urlMesaDetalle: string = `${environment.api}/MesaDetalle`
    private http = inject(HttpClient)
    private helpersServices = inject(HelpersService);
  
    ListarMesas(mesaId: number, tipo: number, pagination: Pagination): Observable<MesaDetallesResponses> {
      let params = this.helpersServices.setParams(pagination)
      params = params.append('mesaId', mesaId)
      params = params.append('tipo', tipo)
      const headers = this.helpersServices.getAutorizationToken()
      return this.http.get<MesaDetallesResponses>(`${this.urlMesaDetalle}/ListarMesaDetalles`, { headers, params })
    }

    registarMesaDetalle(mesaDetalle: MesaDetalleResponse) {      
      const formData = this.generateFormData(mesaDetalle)
      const headers = this.helpersServices.getAutorizationToken()        
      return this.http.post<MesaDetallesResponses>(`${this.urlMesaDetalle}/CrearMesaDetalle`, formData, { headers })
        .pipe(
          tap(resp => {
            return resp
          }),
          map(valid => valid),
          catchError(err => of(err))
        )
    }

    eliminarMesaDetalle(detalleId: string) {
        const headers = this.helpersServices.getAutorizationToken()
        return this.http.delete<MesaDetallesResponses>(`${this.urlMesaDetalle}/EliminarMesaDetalle/${detalleId}`, { headers })
          .pipe(
            tap(resp => {
              return resp
            }),
            map(valid => valid),
            catchError(err => of(err))
          )
      }

    private generateFormData(mesaDetalle: MesaDetalleResponse): FormData {
        const formData = new FormData()
        formData.append('tipo', mesaDetalle.tipo)
        formData.append('mesaId', mesaDetalle.mesaId)
        formData.append('archivo', mesaDetalle.archivo)
        formData.append('usuarioId', mesaDetalle.usuarioId)
        return formData
    }
}
