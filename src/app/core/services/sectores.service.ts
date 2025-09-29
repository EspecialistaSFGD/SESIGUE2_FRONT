import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Observable } from 'rxjs';
import { Pagination, SectoresResponses } from '@core/interfaces';

@Injectable({
  providedIn: 'root'
})
export class SectoresService {
  private urlSector: string = `${environment.api}/Sector`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  listarSectores(pagination: Pagination): Observable<SectoresResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<SectoresResponses>(`${this.urlSector}/ListarSectores`, { headers, params })
  }

  getAllSectors(grupoId: number = 0, tipo: number = 2): Observable<SectoresResponses> {
    let params = new HttpParams()
      .append('grupoId', `${grupoId}`)
      .append('tipo', `${tipo}`);
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<SectoresResponses>(`${this.urlSector}/ListarSector`, { headers, params })
  }
}
