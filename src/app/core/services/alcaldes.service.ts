import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Observable } from 'rxjs';
import { AlcaldesResponses, Pagination } from '@core/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AlcaldesService {
  private urlAlcalde: string = `${environment.api}/Alcalde`

  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  ListarAlcaldes(pagination: Pagination): Observable<AlcaldesResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<AlcaldesResponses>(`${this.urlAlcalde}/ListarAlcaldes`, { headers, params })
  }

  // getAlcaldePorUbigeo(ubigeo: string): Observable<AlcaldesResponses> {
  //   const headers = this.helpersServices.getAutorizationToken()
  //   return this.http.get<AlcaldesResponses>(`${this.urlAlcalde}/ListarAlcaldePorUbigeo/${ubigeo}`, { headers })
  // }
}
