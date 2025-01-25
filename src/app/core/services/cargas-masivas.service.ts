import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { Pagination } from '@core/interfaces';
import { CargaMasivaDetailResponse, CargaMasivaResponse, CargaMasivaSaveResponse, CargasMasivasResponses } from '@core/interfaces/carga-masiva.interface';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CargasMasivasService {
  private urlCargasMasivas: string = `${environment.api}/CargaMasiva`
    private http = inject(HttpClient)
    private helpersServices = inject(HelpersService);
  
    getAllAsistenciasTecnicas(pagination: Pagination): Observable<CargasMasivasResponses> {
      const params = this.helpersServices.setParams(pagination)
      const headers = this.helpersServices.getAutorizationToken()
      return this.http.get<CargasMasivasResponses>(`${this.urlCargasMasivas}/ListarCargasMasivas`, { headers, params })
    }
  
    subirCargaMasiva(cargaMasiva: CargaMasivaSaveResponse) {
      cargaMasiva.code = Number(localStorage.getItem('codigoUsuario')) ?? 0
      const formData = this.generateFormData(cargaMasiva)
      const headers = this.helpersServices.getAutorizationToken()
           
      return this.http.post<CargasMasivasResponses>(`${this.urlCargasMasivas}/SubirCargaMasiva`, formData, { headers })
        .pipe(
          tap(resp => {
            return resp
          }),
          map(valid => valid),
          catchError(err => of(err))
        )
    }

    atencionesCargaMasiva(cargaMasivaId: number, pagination: Pagination): Observable<CargaMasivaDetailResponse> {
      const params = this.helpersServices.setParams(pagination)
      const headers = this.helpersServices.getAutorizationToken()
      return this.http.get<CargaMasivaDetailResponse>(`${this.urlCargasMasivas}/AtencionesCargasMasivas/${cargaMasivaId}`, { headers, params })
    }

    private generateFormData(cargaMasiva: CargaMasivaSaveResponse): FormData {
        const formData = new FormData()
        formData.append('code', `${cargaMasiva.code}`)
        formData.append('archivo', cargaMasiva.archivo)
        formData.append('tabla', `${cargaMasiva.tabla}`)
    
        return formData
      }
}
