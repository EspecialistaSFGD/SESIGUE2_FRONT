import { inject, Injectable } from '@angular/core';
import { DescargarResponses } from '@core/interfaces';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { HelpersService } from './helpers.service';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DescargarService {
  private urlDescargar: string = `${environment.api}/Descargar`
    private http = inject(HttpClient)
    private helpersServices = inject(HelpersService);
  
    descargarPdf(archivo: string): Observable<DescargarResponses> {
      let params = new HttpParams();
      params = params.append('archivo', archivo)

      const headers = this.helpersServices.getAutorizationToken()
      return this.http.get<DescargarResponses>(`${this.urlDescargar}/DescargarPdf`, { headers, params })
    }
}
