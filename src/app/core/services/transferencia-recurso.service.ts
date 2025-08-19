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

  subirRecurso(transferenciaIndice: TransferenciaRecursoData, indice: boolean = true): Observable<TransferenciaRecursoResponses> {
    const headers = this.helpersServices.getAutorizationToken()
    const formData = this.generateFormData(transferenciaIndice)
    const rutaRecurso = indice ? 'SubirIndice' : 'SubirProyeccion'
    return this.http.post<TransferenciaRecursoResponses>(`${this.urlTransferenciaRecurso}/${rutaRecurso}`, formData, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }
  // subirIndice(transferenciaIndice: TransferenciaRecursoData): Observable<TransferenciaRecursoResponses> {
  //   const headers = this.helpersServices.getAutorizationToken()
  //   const formData = this.generateFormData(transferenciaIndice)
  //   return this.http.post<TransferenciaRecursoResponses>(`${this.urlTransferenciaRecurso}/SubirIndice`, formData, { headers })
  //     .pipe(
  //       tap(resp => {
  //         return resp
  //       }),
  //       map(valid => valid),
  //       catchError(err => of(err))
  //     )
  // }

  GenerarMov(transferenciaId:string, pagination: Pagination) {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<ExportResponses>(`${this.urlTransferenciaRecurso}/GenerarMov/${transferenciaId}`, { headers, params })
  }

  private generateFormData(transferenciaIndice: TransferenciaRecursoData): FormData {
      const formData = new FormData()
      formData.append('usuarioId', transferenciaIndice.usuarioId)
      formData.append('recursoId', transferenciaIndice.recursoId)
      formData.append('monto', transferenciaIndice.monto)
      formData.append('fecha', transferenciaIndice.fecha)
      formData.append('archivo', transferenciaIndice.archivo)
      return formData
    }
}
