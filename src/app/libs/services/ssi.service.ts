import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SSIResponse } from '@interfaces/ssi.interface';

@Injectable({
  providedIn: 'root'
})
export class SsiService {
  
  private http = inject(HttpClient)

  obtenerSSIMef(id:string){
    const body = { id, tipo: 'SIAF' }
    const url:string = 'http://ofi5.mef.gob.pe/inviertews/Dashboard/traeDetInvSSI'
    return this.http.post<SSIResponse[]>(url, body)
  }
}
