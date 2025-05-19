import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { IntervencionTareaAvanceResponse, IntervencionTareaAvancesResponses, Pagination } from '@core/interfaces';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IntervencionTareaAvanceService {
  private urlIntervencionTareaAvance: string = `${environment.api}/IntervencionTareaAvance`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);
  
  ListarIntervencionTareaAvances(pagination: Pagination): Observable<IntervencionTareaAvancesResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<IntervencionTareaAvancesResponses>(`${this.urlIntervencionTareaAvance}/ListarIntervencionTareaAvances`, { headers, params })
  }

  registarIntervencionTareaAvance(intervencionTarea: IntervencionTareaAvanceResponse) {
    const headers = this.helpersServices.getAutorizationToken() 
    const formData = this.generateFormData(intervencionTarea)         
    return this.http.post<IntervencionTareaAvanceResponse>(`${this.urlIntervencionTareaAvance}/RegistrarIntervencionTareaAvance`, formData, { headers })
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }

  private generateFormData(tareaAvance: IntervencionTareaAvanceResponse): FormData {
    const formData = new FormData()
    formData.append('avance', tareaAvance.avance)
    formData.append('estadoRegistro', tareaAvance.estadoRegistro)
    formData.append('intervencionTareaId', tareaAvance.intervencionTareaId)
    formData.append('fecha', tareaAvance.fecha)
    formData.append('evidencia', tareaAvance.evidencia ?? '')
    formData.append('accesoId', tareaAvance.accesoId ?? '')
    return formData
  }
}
