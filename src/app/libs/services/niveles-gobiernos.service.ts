import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { NivelesGobiernosResponses } from '@interfaces/nivel-gobierno.interface';
import { Pagination } from '@interfaces/pagination.interface';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root'
})
export class NivelesGobiernosService {
  private urlLugar: string = `${environment.api}/NivelGobierno`

  private http = inject(HttpClient)
  private helpersService = inject(HelpersService)

  getAllNivelesGobiernos(pagination:Pagination){    
    const params =  this.helpersService.setParams(pagination)
    const headers =  this.helpersService.getAutorizationToken()
    return this.http.get<NivelesGobiernosResponses>(`${this.urlLugar}/ListarNivelGobiernos`, { headers, params })
  }
}
