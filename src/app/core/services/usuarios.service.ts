import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Observable } from 'rxjs';
import { Pagination, UsuariosResponses } from '@core/interfaces';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private urlUsuario: string = `${environment.api}/Usuario`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  listarUsuario(pagination: Pagination, perfiles: number[] | null = null): Observable<UsuariosResponses> {
    let params = this.helpersServices.setParams(pagination)
    if(perfiles){
      for(let perfil of perfiles){
        params = params.append('perfil[]', `${perfil}`);
      }
    }
      
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<UsuariosResponses>(`${this.urlUsuario}/ListarUsuarios`, { headers, params })
  }
}
