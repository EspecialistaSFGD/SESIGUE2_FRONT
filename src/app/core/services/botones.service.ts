import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Pagination } from '@core/interfaces';
import { BotonesResponses } from '@core/interfaces/boton.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BotonesService {
  private urlBoton: string = `${environment.api}/Boton`
      
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  listarBotones(pagination: Pagination): Observable<BotonesResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<BotonesResponses>(`${this.urlBoton}/ListarBotones`, { headers, params })
  }
}
