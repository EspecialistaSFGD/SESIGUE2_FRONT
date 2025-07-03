import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { MesaEstadoResponse, MesaEstadosResponses } from '@core/interfaces';
import { catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MesaEstadosService {
  private urlMesaDocumento: string = `${environment.api}/MesaEstado`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  registarMesaDetalle(mesaDetalle: MesaEstadoResponse) {      
    const headers = this.helpersServices.getAutorizationToken()        
    return this.http.post<MesaEstadosResponses>(`${this.urlMesaDocumento}/RegistrarMesaEstado`, mesaDetalle, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }
}
