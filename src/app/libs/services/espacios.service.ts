import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { EspaciosResponses } from '@interfaces/espacios.interfaces';
import { Pagination } from '@interfaces/pagination.interface';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root'
})
export class EspaciosService {
  private urlEspacios: string = `${environment.api}/Espacio`

  private http = inject(HttpClient)
  private helpersService = inject(HelpersService);

  getAllEspacios(pagination:Pagination){    
    const params = this.helpersService.setParams(pagination)
    const headers = this.helpersService.getAutorizationToken()
    return this.http.get<EspaciosResponses>(`${this.urlEspacios}/ListarEspacios`, { headers, params })
  }
}
