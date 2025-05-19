import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { IntervencionTareaAvancesResponses, Pagination } from '@core/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IntervencionTareaAvanceService {
  private urlIntervencionTareaAvance: string = `${environment.api}/IntervencionTareaAvance`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);
  
  ListarIntervencionTareas(pagination: Pagination): Observable<IntervencionTareaAvancesResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<IntervencionTareaAvancesResponses>(`${this.urlIntervencionTareaAvance}/ListarIntervencionTareaAvances`, { headers, params })
  }
}
