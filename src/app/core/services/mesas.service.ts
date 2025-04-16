import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { MesasResponses, Pagination } from '@core/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MesasService {
  private urlMesas: string = `${environment.api}/Mesa`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  ListarMesas(pagination: Pagination): Observable<MesasResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<MesasResponses>(`${this.urlMesas}/ListarMesas`, { headers, params })
  }
}
