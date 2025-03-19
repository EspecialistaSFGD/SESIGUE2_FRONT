import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ExportResponses, Pagination, PaginationTransferences, TransferenciasFinancierasResolucionResponses, TransferenciasFinancierasResponses, TransferenciasFinancierasResumenResponses } from '@core/interfaces';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root'
})
export class TransferenciasFinancierasService {
  private urlTransferencias: string = `${environment.api}/TransferenciaFinanciera`

  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  obtenerTransferenciasFinancierasDetalles(pagination: Pagination, paginationTransferences: PaginationTransferences): Observable<TransferenciasFinancierasResponses> {
    let params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<TransferenciasFinancierasResponses>(`${this.urlTransferencias}/ListarTransferenciaFinancieraDetalle`, { headers, params })
  }

  obtenerTransferenciasFinancierasResumem(pagination: Pagination, paginationTransferences: PaginationTransferences): Observable<TransferenciasFinancierasResumenResponses> {
    let params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    const paramsPage = Object.entries(paginationTransferences).map(([key, value]) => { return { key, value } })  
    return this.http.get<TransferenciasFinancierasResumenResponses>(`${this.urlTransferencias}/ListarTranferenciasFinancierasResumen`, { headers, params })
  }

  obtenerTransferenciasFinancierasResolucion(periodo: number): Observable<TransferenciasFinancierasResolucionResponses> {
    const headers = this.helpersServices.getAutorizationToken()
    const params = new HttpParams().append('periodo', periodo);
    return this.http.get<TransferenciasFinancierasResolucionResponses>(`${this.urlTransferencias}/ListarTransferenciaFinancieraResolucion`, { headers, params })
  }

  reporteTransferenciasFinancieras(pagination: Pagination){
    //ReporteTransferencias
    let params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<ExportResponses>(`${this.urlTransferencias}/ReporteTransferencias`, { headers, params })
  }
}
