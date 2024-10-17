import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Observable } from 'rxjs';
import { EntidadesResponses } from '@core/interfaces/entidad.interface';

@Injectable({
  providedIn: 'root'
})
export class EntidadesService {
  private urlUbigeo: string = `${environment.api}/Entidad`

  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  getEntidadporUbigeo(ubigeo: string): Observable<EntidadesResponses> {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<EntidadesResponses>(`${this.urlUbigeo}/ListarPorUbigeo/${ubigeo}`, { headers })
  }
}
