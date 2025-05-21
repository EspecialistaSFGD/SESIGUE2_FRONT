import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { IntervencionHitosResponses, Pagination } from '@core/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IntervencionHitoService {
  private urlIntervencionHito: string = `${environment.api}/IntervencionHito`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);
  
  ListarIntervencionHitos(pagination: Pagination): Observable<IntervencionHitosResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<IntervencionHitosResponses>(`${this.urlIntervencionHito}/ListarIntervencionHitos`, { headers, params })
  }
}
