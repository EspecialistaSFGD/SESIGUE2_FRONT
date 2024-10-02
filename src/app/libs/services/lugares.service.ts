import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { LugaresResponses } from '@interfaces/lugar.interface';
import { Pagination } from '@interfaces/pagination.interface';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root'
})
export class LugaresService {

  private urlLugar: string = `${environment.api}/Lugar`

  private http = inject(HttpClient)
  private helpersService = inject(HelpersService)

  getAllLugares(pagination:Pagination){    
    const params =  this.helpersService.setParams(pagination)
    const headers =  this.helpersService.getAutorizationToken()
    return this.http.get<LugaresResponses>(`${this.urlLugar}/ListarLugares`, { headers, params })
  }
}
