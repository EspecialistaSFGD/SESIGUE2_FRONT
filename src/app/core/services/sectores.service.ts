import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Observable } from 'rxjs';
import { SectoresResponses } from '@core/interfaces';

@Injectable({
  providedIn: 'root'
})
export class SectoresService {
  private urlSector: string = `${environment.api}/Sector`
    private http = inject(HttpClient)
    private helpersServices = inject(HelpersService);

    getAllSectors(grupoId: number = 0, tipo: number = 4): Observable<SectoresResponses>{
      let params = new HttpParams()
      params.append('grupoId', `${grupoId}`)
      params.append('tipo', `${tipo}`);
      const headers = this.helpersServices.getAutorizationToken()
      return this.http.get<SectoresResponses>(`${this.urlSector}`, { headers, params })
    }
}
