import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { AsistenciasTecnicasResponses, AsistenciaTecnicaResponse } from '@interfaces/asistencia-tecnica.interface';
import { Pagination } from '@interfaces/pagination.interface';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root'
})
export class AsistenciasTecnicasService {

  private urlAsistenciaTecnica: string = `${environment.api}/AsistenciaTecnica`
  private http = inject(HttpClient)
  private helpersService = inject(HelpersService)

  getAllAsistenciasTecnicas(pagination: Pagination): Observable<AsistenciasTecnicasResponses> {
    const params = this.setParams(pagination)
    const headers = this.getAutorizationToken()
    return this.http.get<AsistenciasTecnicasResponses>(`${this.urlAsistenciaTecnica}/ListarAsistenciasTecnicas`, { headers, params })
  }

  registrarAsistenciaTecnica(asistenciTecnica:AsistenciaTecnicaResponse){    
    const headers = this.helpersService.getAutorizationToken()
    const formData:FormData = this.generateFormData( asistenciTecnica )    
    return this.http.post<AsistenciasTecnicasResponses>(`${this.urlAsistenciaTecnica}/RegistrarAsistenciaTecnica`, formData, { headers })
    .pipe(
      tap( resp => {      
        console.log(resp);        
        return resp
      }),
      map( valid => valid.success ),
      catchError( err => of( err ) )
    )
  }

  getAutorizationToken() {
    const { codigo, expiracionToken } = JSON.parse(localStorage.getItem('token') || '')
    return new HttpHeaders().set('Autorization', `Bearer ${codigo}`)
  }

  setParams(pagination: Pagination) {
    pagination.code = Number(localStorage.getItem('codigoUsuario')) ?? 0
    let httpParams = new HttpParams();
    const params = Object.entries(pagination).map(([key, value]) => { return { key, value } })
    for (let param of params) {
      httpParams = httpParams.append(param.key, param.value);
    }
    return httpParams
  }

  private generateFormData( asistencitecnica:AsistenciaTecnicaResponse ):FormData {
    const formData = new FormData()
    formData.append( 'tipo', asistencitecnica.tipo )
    formData.append( 'modalidad', asistencitecnica.modalidad )
    formData.append( 'fechaAtencion', asistencitecnica.fechaAtencion )
    formData.append( 'autoridad', `${asistencitecnica.autoridad}` )
    formData.append( 'dniAutoridad', asistencitecnica.dniAutoridad )
    formData.append( 'nombreAutoridad', asistencitecnica.nombreAutoridad )
    formData.append( 'cargoAutoridad', asistencitecnica.cargoAutoridad )
    formData.append( 'congresista', `${asistencitecnica.congresista}` )
    formData.append( 'dniCongresista', asistencitecnica.dniCongresista )
    formData.append( 'nombreCongresista', asistencitecnica.nombreCongresista )
    formData.append( 'clasificacion', asistencitecnica.clasificacion )
    formData.append( 'tema', asistencitecnica.tema )
    formData.append( 'comentarios', `${ asistencitecnica.comentarios }` )
    formData.append( 'evidenciaReunion', `${ asistencitecnica.evidenciaReunion }` )
    formData.append( 'evidenciaAsistencia', `${ asistencitecnica.evidenciaAsistencia }` )
    formData.append( 'lugarId', asistencitecnica.lugarId )
    formData.append( 'tipoEntidadId', asistencitecnica.tipoEntidadId )
    formData.append( 'entidadId', asistencitecnica.entidadId )
    formData.append( 'espacioId', asistencitecnica.espacioId )
    formData.append( 'code', `${ asistencitecnica.code }` )
    return formData
  }
}
