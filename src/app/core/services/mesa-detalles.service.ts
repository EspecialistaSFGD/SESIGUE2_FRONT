import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { MesaDetallesResponses, Pagination } from '@core/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MesaDetallesService {
  private urlMesaDetalle: string = `${environment.api}/MesaDetalle`
    private http = inject(HttpClient)
    private helpersServices = inject(HelpersService);
  
    ListarMesas(mesaId: number, pagination: Pagination): Observable<MesaDetallesResponses> {
      let params = this.helpersServices.setParams(pagination)
      params = params.append('mesaId', mesaId)
      const headers = this.helpersServices.getAutorizationToken()
      return this.http.get<MesaDetallesResponses>(`${this.urlMesaDetalle}/ListarMesaDetalles`, { headers, params })
    }
}
