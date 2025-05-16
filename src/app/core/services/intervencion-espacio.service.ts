import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IntervencionesEspaciosResponses, IntervencionEspacioResponses, Pagination } from '@core/interfaces';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { HelpersService } from './helpers.service';
@Injectable({
  providedIn: 'root'
})
export class IntervencionEspacioService {
  private urlIntervencionEspacio: string = `${environment.api}/IntervencionEspacio`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);
  
  ListarIntervencionEspacios(pagination: Pagination): Observable<IntervencionesEspaciosResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<IntervencionesEspaciosResponses>(`${this.urlIntervencionEspacio}/ListarIntervencionEspacios`, { headers, params })
  }

  obtenerIntervencionEspacio(inversionEspacioId: string ){
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<IntervencionEspacioResponses>(`${this.urlIntervencionEspacio}/ObtenerIntervencionEspacio/${inversionEspacioId}`, { headers })
  }
}
