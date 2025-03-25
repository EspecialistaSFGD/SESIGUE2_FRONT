import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Pagination, UsuarioMetasResponses } from '@core/interfaces';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioMetasService {
  private urlUsuario: string = `${environment.api}/UsuarioMeta`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  listarUsuario(pagination: Pagination): Observable<UsuarioMetasResponses> {
    let params = this.helpersServices.setParams(pagination)      
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<UsuarioMetasResponses>(`${this.urlUsuario}/ListarUsuarios`, { headers, params })
  }
}
