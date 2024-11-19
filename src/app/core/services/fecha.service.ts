import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Pagination } from '@core/interfaces/pagination.interface';
import { Observable } from 'rxjs';
import { FechasResponses } from '@core/interfaces/fecha.interface';

@Injectable({
  providedIn: 'root'
})
export class FechaService {
  private urlEspacio: string = `${environment.api}/Fecha`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  fechasLaborales(fechaLimite:string, pagination: Pagination): Observable<FechasResponses> {
    let params = this.helpersServices.setParams(pagination)
    params = params.append('fechaLimite', fechaLimite)    
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<FechasResponses>(`${this.urlEspacio}/ListarLaborales`, { headers, params })
  }
}
