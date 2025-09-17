import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Pagination } from '@core/interfaces';
import { AsistenteResponse, AsistenteResponses, AsistentesResponses } from '@core/interfaces/asistente.interface';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsistentesService {
  private urlAsistentes: string = `${environment.api}/Asistente`
  
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  ListarAsistentes(pagination: Pagination): Observable<AsistentesResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<AsistentesResponses>(`${this.urlAsistentes}/ListarAsistentes`, { headers, params })
  }

  registarAsistente(asistente: AsistenteResponse) {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.post<AsistenteResponses>(`${this.urlAsistentes}/RegistrarAsistente`, asistente, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }

  actualizarAsistente(asistente: AsistenteResponse){
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.put<AsistenteResponses>(`${this.urlAsistentes}/ActualizarAsistente/${asistente.asistenteId}`, asistente, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }
}
