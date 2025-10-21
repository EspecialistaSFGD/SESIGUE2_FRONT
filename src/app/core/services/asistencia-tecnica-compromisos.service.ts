import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { AsistenciaTecnicaCompromisoResponse, AsistenciaTecnicaCompromisoResponses, AsistenciaTecnicaCompromisosResponses, Pagination } from '@core/interfaces';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaTecnicaCompromisosService {
  private urlAsistenciaTecnicaCompromiso: string = `${environment.api}/AsistenciaTecnicaCompromiso`
    
    private http = inject(HttpClient)
    private helpersServices = inject(HelpersService);
  
    ListarAsistenciaTecnicaCompromisos(asistenciaTecnicaId: string, pagination: Pagination): Observable<AsistenciaTecnicaCompromisosResponses> {
      const params = this.helpersServices.setParams(pagination)
      const headers = this.helpersServices.getAutorizationToken()
      return this.http.get<AsistenciaTecnicaCompromisosResponses>(`${this.urlAsistenciaTecnicaCompromiso}/ListarCompromisos/${asistenciaTecnicaId}`, { headers, params })
    }
  
    registrarCompromiso(compromiso: AsistenciaTecnicaCompromisoResponse) {
      const headers = this.helpersServices.getAutorizationToken()
      return this.http.post<AsistenciaTecnicaCompromisoResponses>(`${this.urlAsistenciaTecnicaCompromiso}/RegistrarCompromiso`, compromiso, { headers })
        .pipe(
          tap(resp => {
            return resp
          }),
          map(valid => valid.success),
          catchError(err => of(err))
        )
    }

    actualizarCompromiso(compromiso: AsistenciaTecnicaCompromisoResponse) {
      const headers = this.helpersServices.getAutorizationToken()
      return this.http.post<AsistenciaTecnicaCompromisoResponses>(`${this.urlAsistenciaTecnicaCompromiso}/ActualizarCompromiso/${compromiso.compromisoId}`, compromiso, { headers })
        .pipe(
          tap(resp => {
            return resp
          }),
          map(valid => valid.success),
          catchError(err => of(err))
        )
    }
  
    eliminarCompromiso(asistenteId: string) {
      const headers = this.helpersServices.getAutorizationToken()
      return this.http.delete<AsistenciaTecnicaCompromisoResponses>(`${this.urlAsistenciaTecnicaCompromiso}/EliminarCompromiso/${asistenteId}`, { headers })
        .pipe(
          tap(resp => {
            return resp
          }),
          map(valid => valid),
          catchError(err => of(err))
        )
    }
}
