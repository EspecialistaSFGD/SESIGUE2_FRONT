import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { AdjuntoResponse, AdjuntosResponses } from '@core/interfaces';
import { catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdjuntosService {
  private urlAdjunto: string = `${environment.api}/Adjunto`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  registrarAdjunto(adjunto: AdjuntoResponse) {
    const headers = this.helpersServices.getAutorizationToken()          
    const formData = this.generateFormData(adjunto)
    return this.http.post<AdjuntosResponses>(`${this.urlAdjunto}/RegistrarAdjunto`, formData, { headers })
      .pipe(
        tap(resp => resp),
        map(valid => valid),
        catchError(err => of(err))
      )
  }

  private generateFormData(adjunto: AdjuntoResponse): FormData {
    const formData = new FormData()
    formData.append('nombreTabla', adjunto.nombreTabla)
    formData.append('tablaId', adjunto.tablaId)
    formData.append('archivo', adjunto.archivo)
    formData.append('usuarioId', adjunto.usuarioId)
    return formData
  }
}
