import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Pagination, SubTiposResponses } from '@core/interfaces';

@Injectable({
  providedIn: 'root'
})
export class SubTipoService {
  private urlSubTipo: string = `${environment.api}/SubTipo`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  ListarSubTipo(pagination: Pagination){
    let params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<SubTiposResponses>(`${this.urlSubTipo}/ListarSubTipos`, { headers, params })
  }
}
