import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Pagination } from '@core/interfaces';
import { PerfilesResponses, PerfilResponses } from '@core/interfaces/perfil.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PerfilesService {
  private urlLugar: string = `${environment.api}/Perfil`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  listarPerfiles(pagination: Pagination): Observable<PerfilesResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<PerfilesResponses>(`${this.urlLugar}/ListarPerfiles`, { headers, params })
  }

  obtenerPerfil(perfilId: string): Observable<PerfilResponses> {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<PerfilResponses>(`${this.urlLugar}/ObtenerPerfil/${perfilId}`, { headers })
  }
}
