import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Pagination } from '@interfaces/pagination.interface';
import { LugaresResponses } from '@interfaces/lugar.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EspaciosService {
  private urllugar: string = `${environment.api}/Lugar`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  getAllLugares(pagination: Pagination): Observable<LugaresResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<LugaresResponses>(`${this.urllugar}/ListarLugares`, { headers, params })
  }
}
