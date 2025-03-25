import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MetaUsuarioResponse, Pagination, UsuarioMetasResponses } from '@core/interfaces';
import { environment } from '@environments/environment';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioMetasService {
  private urlUsuarioMeta: string = `${environment.api}/UsuarioMeta`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  listarUsuario(pagination: Pagination): Observable<UsuarioMetasResponses> {
    let params = this.helpersServices.setParams(pagination)      
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<UsuarioMetasResponses>(`${this.urlUsuarioMeta}/ListarUsuarios`, { headers, params })
  }

  registarMetaUsuario(usuarioMeta: MetaUsuarioResponse) {
      const headers = this.helpersServices.getAutorizationToken()            
      return this.http.post<MetaUsuarioResponse>(`${this.urlUsuarioMeta}/RegistrarMeta`, usuarioMeta, { headers })
        .pipe(
          tap(resp => {
            return resp
          }),
          map(valid => valid),
          catchError(err => of(err))
        )
    }
}
