import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EventoSectorDetalleResponses } from '@core/interfaces/evento-sector-detalle.interface';
import { environment } from '@environments/environment';
import { catchError, map, of, tap } from 'rxjs';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root'
})
export class EventoSectorDetallesService {
  private urlSectorDetalle: string = `${environment.api}/EventoSectorDetalle`
  private http = inject(HttpClient)
  private helpersServices = inject(HelpersService);

  RegistrarEventoDetalleSector(eventoSectorDetalle: EventoSectorDetalleResponses) {
      const headers = this.helpersServices.getAutorizationToken()
      return this.http.post<EventoSectorDetalleResponses>(`${this.urlSectorDetalle}/RegistrarEventoDetalleSector`, eventoSectorDetalle, { headers })
        .pipe(
          tap(resp => resp),
          map(valid => valid),
          catchError(err => of(err))
        )
    }
}
