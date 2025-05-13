import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Pagination } from '@core/interfaces';
import { Observable } from 'rxjs';
import { InversionEtapasResponses } from '@core/interfaces/inversion-etapa.interface';

@Injectable({
  providedIn: 'root'
})
export class InversionEtapaService {
  private urlInversionEtapa: string = `${environment.api}/InversionEtapa`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);
  
  ListarInversionEtapas(pagination: Pagination): Observable<InversionEtapasResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<InversionEtapasResponses>(`${this.urlInversionEtapa}/ListarInversionesEtapas`, { headers, params })
  }
}
