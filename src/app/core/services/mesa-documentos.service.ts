import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { MesaDocumentoResponse, MesaDocumentossResponses, Pagination } from '@core/interfaces';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MesaDocumentosService {
  private urlMesaDocumento: string = `${environment.api}/MesaDocumento`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  ListarMesaDetalle(mesaId: number, tipo: number, pagination: Pagination): Observable<MesaDocumentossResponses> {
    let params = this.helpersServices.setParams(pagination)
    params = params.append('mesaId', mesaId)
    params = params.append('tipo', tipo)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<MesaDocumentossResponses>(`${this.urlMesaDocumento}/ListarMesaDocumentos`, { headers, params })
  }

  registarMesaDetalle(mesaDetalle: MesaDocumentoResponse) {      
  const formData = this.generateFormData(mesaDetalle)
  const headers = this.helpersServices.getAutorizationToken()        
  return this.http.post<MesaDocumentossResponses>(`${this.urlMesaDocumento}/CrearMesaDocumento`, formData, { headers })
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
    return this.http.delete<MesaDocumentossResponses>(`${this.urlMesaDocumento}/EliminarMesaDocumento/${detalleId}`, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }

  private generateFormData(mesaDetalle: MesaDocumentoResponse): FormData {
    const formData = new FormData()
    formData.append('nombre', mesaDetalle.nombre)
    formData.append('fechaCreacion', mesaDetalle.fechaCreacion)
    formData.append('tipo', mesaDetalle.tipo)
    formData.append('mesaId', mesaDetalle.mesaId)
    formData.append('archivo', mesaDetalle.archivo)
    formData.append('usuarioId', mesaDetalle.usuarioId)
    return formData
  }
}
