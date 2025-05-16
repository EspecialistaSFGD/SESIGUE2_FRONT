import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { IntervencionTareasResponses, Pagination } from '@core/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IntervencionTareaService {
  private urlIntervencionTarea: string = `${environment.api}/IntervencionTarea`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);
  
  ListarIntervencionFase(pagination: Pagination): Observable<IntervencionTareasResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<IntervencionTareasResponses>(`${this.urlIntervencionTarea}/ListarIntervencionTareas`, { headers, params })
  }
}
