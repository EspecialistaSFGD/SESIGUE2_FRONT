import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { IntervencionEtapasResponses, Pagination } from '@core/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IntervencionEtapaService {
  private urlIntervencionEtapa: string = `${environment.api}/IntervencionEtapa`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);
  
  ListarIntervencionEtapas(pagination: Pagination): Observable<IntervencionEtapasResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<IntervencionEtapasResponses>(`${this.urlIntervencionEtapa}/ListarIntervencionEtapas`, { headers, params })
  }
}
