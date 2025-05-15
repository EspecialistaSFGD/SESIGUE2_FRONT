import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { InversionHitosResponses, Pagination } from '@core/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InversionHitoService {
  private urlInversionHito: string = `${environment.api}/InversionHito`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);
  
  ListarInversionHitos(pagination: Pagination): Observable<InversionHitosResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<InversionHitosResponses>(`${this.urlInversionHito}/ListarInversionesHitos`, { headers, params })
  }
}
