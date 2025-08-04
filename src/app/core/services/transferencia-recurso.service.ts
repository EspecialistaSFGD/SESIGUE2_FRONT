import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { ExportResponses, MesasResponses, Pagination } from '@core/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransferenciaRecursoService {
  private urlTransferenciaRecurso: string = `${environment.api}/TransferenciaRecurso`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  GenerarMov(transferenciaId:string, pagination: Pagination) {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<ExportResponses>(`${this.urlTransferenciaRecurso}/GenerarMov/${transferenciaId}`, { headers, params })
  }
}
