import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Pagination } from '@core/interfaces';
import { Observable } from 'rxjs';
import { InversionFasesResponses } from '@core/interfaces/inversion-fase.interface';

@Injectable({
  providedIn: 'root'
})
export class InversionFaseService {
  private urlInversionFase: string = `${environment.api}/InversionFase`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);
  
  ListarInversionFase(pagination: Pagination): Observable<InversionFasesResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<InversionFasesResponses>(`${this.urlInversionFase}/ListarInversionesFases`, { headers, params })
  }
}
