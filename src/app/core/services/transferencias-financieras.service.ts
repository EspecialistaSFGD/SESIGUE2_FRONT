import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Observable } from 'rxjs';
import { Pagination, TransferenciasFinancierasResponses } from '@core/interfaces';

@Injectable({
  providedIn: 'root'
})
export class TransferenciasFinancierasService {
  private urlTransferencias: string = `${environment.api}/TransferenciaFinanciera`

  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  obtenerTransferenciasFinancierasDetalles(pagination: Pagination, periodo:string | null = null): Observable<TransferenciasFinancierasResponses> {
    let params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    if(periodo){
      params = params.append('periodo', periodo)
    }
    return this.http.get<TransferenciasFinancierasResponses>(`${this.urlTransferencias}/ListarTransferenciaFinancieraDetalle`, { headers, params })
  }
}
