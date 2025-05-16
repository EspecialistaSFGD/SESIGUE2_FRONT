import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { IntervencionFasesResponses, Pagination } from '@core/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IntervencionFaseService {
  private urlIntervencionFase: string = `${environment.api}/IntervencionFase`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);
  
  ListarIntervencionFases(pagination: Pagination): Observable<IntervencionFasesResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<IntervencionFasesResponses>(`${this.urlIntervencionFase}/ListarIntervencionFases`, { headers, params })
  }
}
