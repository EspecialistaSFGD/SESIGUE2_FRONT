import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { InversionTareasResponses, Pagination } from '@core/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InversionTareaService {
  private urlInversionTarea: string = `${environment.api}/InversionTarea`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);
  
  ListarInversionFase(pagination: Pagination): Observable<InversionTareasResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<InversionTareasResponses>(`${this.urlInversionTarea}/ListarInversionesTarea`, { headers, params })
  }
}
