import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IntervencionesEspaciosResponses, IntervencionEspacioResponse, IntervencionEspacioResponses, Pagination } from '@core/interfaces';
import { environment } from '@environments/environment';
import { catchError, map, Observable, of, tap } from 'rxjs';
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

  obtenerIntervencionEspacio(intervencionEspacioId:string, pagination: Pagination ){
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<IntervencionEspacioResponses>(`${this.urlIntervencionEspacio}/ObtenerIntervencionEspacio/${intervencionEspacioId}`, { headers, params })
  }

  registrarIntervencionEspacio(intervencionEspacio: IntervencionEspacioResponse) {  
      const headers = this.helpersServices.getAutorizationToken()
      return this.http.post<IntervencionEspacioResponse>(`${this.urlIntervencionEspacio}/RegistrarIntervencionEspacio`, intervencionEspacio, { headers })
        .pipe(
          tap(resp => {
            return resp
          }),
          map(valid => valid),
          catchError(err => of(err))
        )
    }
}
