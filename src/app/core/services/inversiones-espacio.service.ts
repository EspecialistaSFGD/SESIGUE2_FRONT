import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { InversionesEspaciosResponses, InversionEspacioResponses, Pagination } from '@core/interfaces';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { HelpersService } from './helpers.service';
@Injectable({
  providedIn: 'root'
})
export class InversionesEspacioService {
  private urlInversionEspacio: string = `${environment.api}/InversionEspacio`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);
  
  ListarInversionEspacios(pagination: Pagination): Observable<InversionesEspaciosResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<InversionesEspaciosResponses>(`${this.urlInversionEspacio}/ListarInversionesEspacio`, { headers, params })
  }

  obtenerInversionEspacio(inversionEspacioId: string ){
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<InversionEspacioResponses>(`${this.urlInversionEspacio}/ObtenerInversionEspacio/${inversionEspacioId}`, { headers })
  }
}
