import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ExportResponses, Pagination, TransferenciaRecursoData, TransferenciaRecursoResponses, TransferenciasRecursosResponses } from '@core/interfaces';
import { environment } from '@environments/environment';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root'
})
export class TransferenciaRecursoService {
  private urlTransferenciaRecurso: string = `${environment.api}/TransferenciaRecurso`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  ListarTransferenciasRecurso(pagination: Pagination): Observable<TransferenciasRecursosResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<TransferenciasRecursosResponses>(`${this.urlTransferenciaRecurso}/ListarTransferenciasRecursos`, { headers, params })
  }

  subirIndice(transferenciaIndice: TransferenciaRecursoData): Observable<TransferenciaRecursoResponses> {
    const headers = this.helpersServices.getAutorizationToken()
    const formData = this.generateFormDataIndex(transferenciaIndice)
    return this.http.post<TransferenciaRecursoResponses>(`${this.urlTransferenciaRecurso}/SubirIndice`, formData, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }

  GenerarMov(transferenciaId:string, pagination: Pagination) {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<ExportResponses>(`${this.urlTransferenciaRecurso}/GenerarMov/${transferenciaId}`, { headers, params })
  }

  private generateFormDataIndex(transferenciaIndice: TransferenciaRecursoData): FormData {
      const formData = new FormData()
      formData.append('usuarioId', transferenciaIndice.usuarioId)
      formData.append('recursoId', transferenciaIndice.recursoId)
      formData.append('fecha', transferenciaIndice.fecha)
      formData.append('archivo', transferenciaIndice.archivo)
      return formData
    }
}
