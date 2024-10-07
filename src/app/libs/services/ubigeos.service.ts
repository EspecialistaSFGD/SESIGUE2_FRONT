import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { HelpersService } from './helpers.service';
import { UbigeosDepartamentosResponses, UbigeosDistritosResponses, UbigeosProvinciasResponses } from '@interfaces/ubigeo.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UbigeosService {
  private urlUbigeo: string = `${environment.api}/Ubigeo`

  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  getDepartments(): Observable<UbigeosDepartamentosResponses> {
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<UbigeosDepartamentosResponses>(`${this.urlUbigeo}/ListarDepartamento`, { headers })
  }

  getProvinces(departamento: string): Observable<UbigeosProvinciasResponses> {
    const headers = this.helpersServices.getAutorizationToken()
    let params = new HttpParams();
    params = params.append("departamento", departamento);
    params = params.append("tipo", 0);
    return this.http.get<UbigeosProvinciasResponses>(`${this.urlUbigeo}/ListarProvincia`, { headers, params })
  }

  getDistricts(provincia: string): Observable<UbigeosDistritosResponses> {
    const headers = this.helpersServices.getAutorizationToken()
    let params = new HttpParams();
    params = params.append("provincia", provincia);
    params = params.append("tipo", 0);
    return this.http.get<UbigeosDistritosResponses>(`${this.urlUbigeo}/ListarDistrito`, { headers, params })
  }
}
