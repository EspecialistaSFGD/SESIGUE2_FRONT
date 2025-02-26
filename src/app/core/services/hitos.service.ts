import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { PaginationPanel } from '@core/interfaces';
import { HitosPanelResponses } from '@core/interfaces/hito.interface';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root'
})
export class HitosService {
  private urlAcuerdo: string = `${environment.api}/Hito`

  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  getHitoDashboard(pagination: PaginationPanel): Observable<HitosPanelResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<HitosPanelResponses>(`${this.urlAcuerdo}/ReportePanel`, { headers, params })
  }
}
