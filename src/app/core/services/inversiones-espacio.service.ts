import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { InversionesEspacioResponsesResponses, Pagination } from '@core/interfaces';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class InversionesEspacioService {
  private urlInversionEspacio: string = `${environment.api}/InversionEspacio`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);
  
  ListarInversionesEspacio(pagination: Pagination): Observable<InversionesEspacioResponsesResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<InversionesEspacioResponsesResponses>(`${this.urlInversionEspacio}/ListarInversionesEspacio`, { headers, params })
  }
}
