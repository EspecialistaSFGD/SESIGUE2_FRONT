import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Pagination } from '@core/interfaces';
import { Observable } from 'rxjs';
import { AccesosResponses } from '@core/interfaces/acceso.interface';

@Injectable({
  providedIn: 'root'
})
export class AccesosService {
  private urlSector: string = `${environment.api}/Acceso`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  ListarAccesos(pagination: Pagination): Observable<AccesosResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<AccesosResponses>(`${this.urlSector}/ListarAccesos`, { headers, params })
  }
}
