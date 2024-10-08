import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Pagination } from '@interfaces/pagination.interface';
import { Observable } from 'rxjs';
import { NivelGobiernosResponses } from '@interfaces/nivel-gobierno.interface';

@Injectable({
  providedIn: 'root'
})
export class NivelGobiernosService {
  private urlNivelGobierno: string = `${environment.api}/NivelGobierno`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  getAllNivelGobiernos(pagination: Pagination): Observable<NivelGobiernosResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<NivelGobiernosResponses>(`${this.urlNivelGobierno}/ListarNivelGobiernos`, { headers, params })
  }
}
