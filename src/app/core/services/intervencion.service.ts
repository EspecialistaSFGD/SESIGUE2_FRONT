import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Pagination } from '@core/interfaces';
import { IntervencionesPanelResponses } from '@core/interfaces/intervencion.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IntervencionService {
  private urlIntervencionEtapa: string = `${environment.api}/Intervencion`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);
  
  ListarIntervencionEtapas(pagination: Pagination): Observable<IntervencionesPanelResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<IntervencionesPanelResponses>(`${this.urlIntervencionEtapa}/ReportePanelIntervencion`, { headers, params })
  }
}
