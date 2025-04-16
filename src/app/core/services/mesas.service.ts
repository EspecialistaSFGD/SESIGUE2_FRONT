import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { MesaResponse, MesasResponses, Pagination } from '@core/interfaces';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MesasService {
  private urlMesas: string = `${environment.api}/Mesa`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  ListarMesas(pagination: Pagination): Observable<MesasResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<MesasResponses>(`${this.urlMesas}/ListarMesas`, { headers, params })
  }

  registarMesa(nombre: string) {
      const headers = this.helpersServices.getAutorizationToken()  
      const body = { nombre }          
      return this.http.post<MesaResponse>(`${this.urlMesas}/RegistrarMesa`, body, { headers })
        .pipe(
          tap(resp => {
            return resp
          }),
          map(valid => valid),
          catchError(err => of(err))
        )
    }
}
