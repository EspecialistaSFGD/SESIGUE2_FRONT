import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { AtencionesCargasMasivasResponses, Pagination } from '@core/interfaces';
import { CargaMasivaResponse, CargaMasivaUploadResponse, CargasMasivasResponses, CargaMasivaResponseDetail } from '@core/interfaces/carga-masiva.interface';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CargasMasivasService {
  private urlCargasMasivas: string = `${environment.api}/CargaMasiva`
    private http = inject(HttpClient)
    private helpersServices = inject(HelpersService);
  
    getAllCargasMasivas(pagination: Pagination): Observable<CargasMasivasResponses> {
      const params = this.helpersServices.setParams(pagination)
      params.append('tabla', 'atencion')
      const headers = this.helpersServices.getAutorizationToken()
      console.log(params);
      
      return this.http.get<CargasMasivasResponses>(`${this.urlCargasMasivas}/ListarCargasMasivas`, { headers, params })
    }

    getCargaMasiva(cargaMasivaId: string): Observable<CargaMasivaResponseDetail> {
      const headers = this.helpersServices.getAutorizationToken()
      return this.http.get<CargaMasivaResponseDetail>(`${this.urlCargasMasivas}/ObtenerCargaMasiva/${cargaMasivaId}`, { headers })
    }
  
    subirCargaMasiva(cargaMasiva: CargaMasivaUploadResponse) {
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

    atencionesCargaMasiva(cargaMasivaId: string, pagination: Pagination): Observable<AtencionesCargasMasivasResponses> {
      const params = this.helpersServices.setParams(pagination)
      const headers = this.helpersServices.getAutorizationToken()
      return this.http.get<AtencionesCargasMasivasResponses>(`${this.urlCargasMasivas}/AtencionesCargasMasivas/${cargaMasivaId}`, { headers, params })
    }

    private generateFormData(cargaMasiva: CargaMasivaUploadResponse): FormData {
        const formData = new FormData()
        formData.append('code', `${cargaMasiva.code}`)
        formData.append('archivo', cargaMasiva.archivo)
        formData.append('tabla', `${cargaMasiva.tabla}`)
    
        return formData
      }
}
