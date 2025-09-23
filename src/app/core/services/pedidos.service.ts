import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Pagination } from '@core/interfaces';
import { Observable } from 'rxjs';
import { PedidosResponses } from '@core/interfaces/pedido.interface';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private urlPedido: string = `${environment.api}/PrioridadAcuerdo`
  
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  ListarPedidos(pagination: Pagination): Observable<PedidosResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<PedidosResponses>(`${this.urlPedido}/ListarPedidos`, { headers, params })
  }
}
