import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ExportResponses, Pagination, TransferenciasRecursosResponses } from '@core/interfaces';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
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

  GenerarMov(transferenciaId:string, pagination: Pagination) {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<ExportResponses>(`${this.urlTransferenciaRecurso}/GenerarMov/${transferenciaId}`, { headers, params })
  }
}
