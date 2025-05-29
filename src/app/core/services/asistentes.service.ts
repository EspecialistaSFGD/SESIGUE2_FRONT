import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Observable } from 'rxjs';
import { Pagination } from '@core/interfaces';
import { AsistentesResponses } from '@core/interfaces/asistente.interface';

@Injectable({
  providedIn: 'root'
})
export class AsistentesService {
  private urlAsistentes: string = `${environment.api}/Asistente`
  
    private http = inject(HttpClient)
    private helpersServices = inject(HelpersService);
  
    ListarAsistentes(pagination: Pagination): Observable<AsistentesResponses> {
      const params = this.helpersServices.setParams(pagination)
      const headers = this.helpersServices.getAutorizationToken()
      return this.http.get<AsistentesResponses>(`${this.urlAsistentes}/ListarAsistentes`, { headers, params })
    }
}
