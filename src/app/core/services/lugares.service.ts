import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Pagination } from '@core/interfaces/pagination.interface';
import { Observable } from 'rxjs';
import { LugaresResponses } from '@core/interfaces/lugar.interface';

@Injectable({
  providedIn: 'root'
})
export class LugaresService {
  private urlLugar: string = `${environment.api}/Lugar`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  getAllLugares(pagination: Pagination): Observable<LugaresResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<LugaresResponses>(`${this.urlLugar}/ListarLugares`, { headers, params })
  }
}
