import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Observable } from 'rxjs';
import { AcuerdosPanelResponses, PaginationPanel } from '@core/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AcuerdosService {
  private urlAcuerdo: string = `${environment.api}/Acuerdo`

  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  getAcuerdoDashboard(pagination: PaginationPanel): Observable<AcuerdosPanelResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<AcuerdosPanelResponses>(`${this.urlAcuerdo}/ReportePanel`, { headers, params })
  }
}
