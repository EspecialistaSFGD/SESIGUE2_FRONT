import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Pagination } from '@core/interfaces';
import { EventoSectoresResponses } from '@core/interfaces/evento-sectores.interface';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
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
}
