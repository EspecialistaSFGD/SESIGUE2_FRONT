import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { UbigeoDepartamentosResponse } from '@interfaces/ubigeo.interface';

@Injectable({
  providedIn: 'root'
})
export class UbigeosService {
  private urlEspacios: string = `${environment.api}/Ubigeo`

  private http = inject(HttpClient)
  private helpersService = inject(HelpersService);

  getAllDepartamentos(){    
    const headers = this.helpersService.getAutorizationToken()
    return this.http.get<UbigeoDepartamentosResponse>(`${this.urlEspacios}/ListarDepartamento`, { headers })
  }
}
