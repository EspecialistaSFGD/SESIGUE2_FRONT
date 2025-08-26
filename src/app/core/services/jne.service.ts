import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { JneAutoridadesPorDniResponses, JneAutoridadesResponses, JneRequest } from '@core/interfaces';
import { catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JneService {
  private urlJne: string = `https://cej.jne.gob.pe/Autoridades`
  
  private http = inject(HttpClient)

  obtenerAutoridades(autoridad: JneRequest){
    return this.http.post<JneAutoridadesResponses>(`${this.urlJne}/ListarConformacionActual`, autoridad)
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }

  obtenerAutoridadesPorDni(dni:string){
    const strDocumentoIdentidad = dni;
    return this.http.post<JneAutoridadesPorDniResponses>(`${this.urlJne}/BuscarPorDNI`, strDocumentoIdentidad)
      .pipe(
        tap(resp => {
          return resp
        }),
        map(valid => valid),
        catchError(err => of(err))
      )
  }
}
