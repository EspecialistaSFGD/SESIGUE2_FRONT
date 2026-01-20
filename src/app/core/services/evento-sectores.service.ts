import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EventoSectoresResponses, EventoSectorResponse, EventoSectorResponses, Pagination } from '@core/interfaces';
import { environment } from '@environments/environment';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root'
})
export class EventoSectoresService {
  private urlSector: string = `${environment.api}/EventoSector`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  listarEventoSectores(pagination: Pagination): Observable<EventoSectoresResponses> {
    const params = this.helpersServices.setParams(pagination)
    const headers = this.helpersServices.getAutorizationToken()
    return this.http.get<EventoSectoresResponses>(`${this.urlSector}/ListarEventoSectores`, { headers, params })
  }

  registrarEventoSector(eventoSector: EventoSectorResponse) {
      const headers = this.helpersServices.getAutorizationToken()
      return this.http.post<EventoSectorResponses>(`${this.urlSector}/RegistrarEventoSector`, eventoSector, { headers })
        .pipe(
          tap(resp => resp),
          map(valid => valid),
          catchError(err => of(err))
        )
    }

  actualizarEventoSector(eventoSector: EventoSectorResponse) {
      const headers = this.helpersServices.getAutorizationToken()
      return this.http.put<EventoSectorResponses>(`${this.urlSector}/ActualizarEventoSector/${eventoSector.eventoSectorId}`, eventoSector, { headers })
        .pipe(
          tap(resp => resp),
          map(valid => valid),
          catchError(err => of(err))
        )
    }
}
