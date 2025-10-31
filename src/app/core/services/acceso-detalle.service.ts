import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { AccesoDetalleResponses, AccesoDetallesResponses, Pagination } from '@core/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccesoDetalleService {
  private urlAccesoDetalle: string = `${environment.api}/AccesoDetalle`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  ListarAccesoDetalle(pagination: Pagination): Observable<AccesoDetallesResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<AccesoDetallesResponses>(`${this.urlAccesoDetalle}/ListarAccesoDetalle`, { headers, params })
  }

  ObtenerAccesoDetalle(accesoDetalleId: string): Observable<AccesoDetalleResponses> {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<AccesoDetalleResponses>(`${this.urlAccesoDetalle}/ObtenerAccesoDetalle/${accesoDetalleId}`, { headers })
  }
}
