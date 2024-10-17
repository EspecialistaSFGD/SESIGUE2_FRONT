import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { EspaciosResponses } from '@core/interfaces/espacio.interface';
import { Pagination } from '@core/interfaces/pagination.interface';
import { Observable } from 'rxjs';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root'
})
export class EspaciosService {
  private urlEspacio: string = `${environment.api}/Espacio`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  getAllEspacios(pagination: Pagination): Observable<EspaciosResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<EspaciosResponses>(`${this.urlEspacio}/ListarEspacios`, { headers, params })
  }
}
