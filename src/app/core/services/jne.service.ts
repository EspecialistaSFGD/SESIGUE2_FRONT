import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { JneAutoridadesResponses, JneAutoridadParams, JneAutoridadResponses } from '@core/interfaces';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root'
})
export class JneService {
  private urlJne: string = `${environment.api}/Jne`
  
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  obtenerAutoridades(jneParams: JneAutoridadParams ): Observable<JneAutoridadesResponses> {
    let params = new HttpParams();
    params = params.append('tipo', jneParams.tipo);
    params = params.append('ubigeo', jneParams.ubigeo);
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<JneAutoridadesResponses>(`${this.urlJne}/ObtenerAutoridades`, { headers, params })
  }

  obtenerAutoridadPorDni(dni: string ): Observable<JneAutoridadResponses> {
    let params = new HttpParams();
    params = params.append('dni', dni);
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<JneAutoridadResponses>(`${this.urlJne}/ObtenerAutoridadPorDni`, { headers, params })
  }
  
}
