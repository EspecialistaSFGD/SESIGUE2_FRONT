import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { AsistenciaTecnicaResponse, AsistenciasTecnicasResponse, AsistentesAtencionResponse } from '@core/interfaces/asistencia-tecnica.interface';
import { Pagination } from '@core/interfaces/pagination.interface';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { HelpersService } from './helpers.service';
import { ExportResponses } from '@core/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AsistenciasTecnicasService {

  private urlAsistenciaTecnica: string = `${environment.api}/AsistenciaTecnica`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  getAllAsistenciasTecnicas(pagination: Pagination): Observable<AsistenciasTecnicasResponse> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<AsistenciasTecnicasResponse>(`${this.urlAsistenciaTecnica}/ListarAsistenciasTecnicas`, { headers, params })
  }

  obtenerAsistente(numeroDocumento:string, eventoId: number){
    let params = new HttpParams()
      .append('numeroDocumento', numeroDocumento)
      .append('eventoId', eventoId )
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<AsistentesAtencionResponse>(`${this.urlAsistenciaTecnica}/ObtenerAsistente`, { headers, params })
  }

  reporteAtenciones(pagination: Pagination){
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<ExportResponses>(`${this.urlAsistenciaTecnica}/ReporteAsistenciasTecnicas`, { headers, params })
  }

  registrarAsistenciaTecnica(asistenciaTecnica: AsistenciaTecnicaResponse) {
    asistenciaTecnica.code = Number(localStorage.getItem('codigoUsuario')) ?? 0
    asistenciaTecnica.estado = true;    
    const formData = this.generateFormData(asistenciaTecnica)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.post<AsistenciasTecnicasResponse>(`${this.urlAsistenciaTecnica}/RegistrarAsistenciaTecnica`, formData, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }

  actualizarAsistenciaTecnica(asistenciaTecnica: AsistenciaTecnicaResponse) {
    const formData = this.generateFormData(asistenciaTecnica)
    const headers = this.helpersServices.getAutorizationToken()
    asistenciaTecnica.estado = true;
    return this.http.put<AsistenciasTecnicasResponse>(`${this.urlAsistenciaTecnica}/ActualizarAsistenciaTecnica/${asistenciaTecnica.asistenciaId}`, formData, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid.success),
        catchError(err => of(err))
      )
  }

  validarAsistenciaTecnica(asistenciaId: string) {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.put<AsistenciasTecnicasResponse>(`${this.urlAsistenciaTecnica}/ValidarAsistenciaTecnica/${asistenciaId}`, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid.success),
        catchError(err => of(err))
      )
  }

  deleteAsistenciaTecnica(asistenciaId: string) {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.delete<AsistenciasTecnicasResponse>(`${this.urlAsistenciaTecnica}/EliminarAsistenciaTecnica/${asistenciaId}`, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }

  private generateFormData(asistenciaTecnica: AsistenciaTecnicaResponse): FormData {
    const formData = new FormData()
    formData.append('tipoPerfil', asistenciaTecnica.tipoPerfil)
    formData.append('tipo', asistenciaTecnica.tipo)
    formData.append('modalidad', asistenciaTecnica.modalidad)
    formData.append('fechaAtencion', `${asistenciaTecnica.fechaAtencion}`)
    formData.append('lugarId', asistenciaTecnica.lugarId)
    formData.append('sectorId', asistenciaTecnica.sectorId)
    formData.append('tipoEntidadId', asistenciaTecnica.tipoEntidadId)
    formData.append('entidadId', asistenciaTecnica.entidadId)
    formData.append('autoridad', `${asistenciaTecnica.autoridad}`)
    formData.append('dniAutoridad', asistenciaTecnica.dniAutoridad)
    formData.append('nombreAutoridad', asistenciaTecnica.nombreAutoridad)
    formData.append('cargoAutoridad', asistenciaTecnica.cargoAutoridad)
    formData.append('contactoAutoridad', asistenciaTecnica.contactoAutoridad)
    formData.append('dniCongresista', asistenciaTecnica.dniCongresista)
    formData.append('congresista', `${asistenciaTecnica.congresista}`)
    formData.append('nombreCongresista', asistenciaTecnica.nombreCongresista)
    formData.append('espacioId', asistenciaTecnica.espacioId)
    formData.append('unidadId', asistenciaTecnica.unidadId)
    formData.append('eventoId', asistenciaTecnica.eventoId)
    formData.append('orientacionId', asistenciaTecnica.orientacionId)
    formData.append('clasificacion', asistenciaTecnica.clasificacion)
    formData.append('tema', asistenciaTecnica.tema)
    formData.append('comentarios', asistenciaTecnica.comentarios)
    formData.append('code', `${asistenciaTecnica.code}`)
    formData.append('evidenciaReunion', asistenciaTecnica.evidenciaReunion)
    formData.append('evidenciaAsistencia', asistenciaTecnica.evidenciaAsistencia)
    formData.append('estado', `${asistenciaTecnica.estado}`)
    formData.append('validado', `${asistenciaTecnica.validado}`)

    return formData
  }
}
