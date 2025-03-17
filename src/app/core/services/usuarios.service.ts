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
  
    listarUsuario(pagination: Pagination): Observable<UsuariosResponses> {
      let params = this.helpersServices.setParams(pagination)
        // .append("sectorId", sector)
        // .append("entidadId", entidades)
      // if (entidades.length > 0) {
      //     // clasificacion.forEach((clas: SelectModel) => {
      //     //     params = params.append('clasificacionId[]', `${clas.value}`);
      //     // });
      //     for(let entidad of entidades){
      //       params = params.append('entidad[]', `${clas.value}`);
      //     }
      // }
        // .append("entidadId", entidad)
        
      const headers = this.helpersServices.getAutorizationToken()
      return this.http.get<UsuariosResponses>(`${this.urlUsuario}/ListarUsuarios`, { headers, params })
    }
}
