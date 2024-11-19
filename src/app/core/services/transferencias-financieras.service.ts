import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Observable } from 'rxjs';
import { Pagination, PaginationTransferences, TransferenciasFinancierasResponses } from '@core/interfaces';

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
    const paramsPage = Object.entries(paginationTransferences).map(([key, value]) => { return { key, value } })
    for (let paramPage of paramsPage) {
      if(paramPage.value){
        params = params.append(paramPage.key, paramPage.value);
      }
    }    
    return this.http.get<TransferenciasFinancierasResponses>(`${this.urlTransferencias}/ListarTransferenciaFinancieraDetalle`, { headers, params })
  }
}
