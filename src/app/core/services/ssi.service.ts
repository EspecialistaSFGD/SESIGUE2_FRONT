import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SsiInversionResponses } from '@core/interfaces/ssi.interface';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root'
})
export class SsiService {
  private urlSsi: string = `${environment.api}/Ssi`
    
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService)

  obtenerInversion(codigo: string){
    let params = new HttpParams();
    params = params.append('codigo', codigo);
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<SsiInversionResponses>(`${this.urlSsi}/ObtenerInversion`, { headers, params })
  }
}
