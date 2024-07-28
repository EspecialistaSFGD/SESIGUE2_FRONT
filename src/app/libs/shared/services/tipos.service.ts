import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '../../../../environments/environment.development';
import { Observable, catchError, map, of } from 'rxjs';
import { ResponseModel } from '../../models/shared/response.model';
import { SelectModel } from '../../models/shared/select.model';

interface State {
  tipos: SelectModel[];
}

@Injectable({
  providedIn: 'root'
})
export class TiposService {

  public msg = inject(NzMessageService);
  public http = inject(HttpClient);

  #tiposRequerimiento = signal<State>({
    tipos: [],
  });

  #tiposEstado = signal<State>({
    tipos: [],
  });

  #tiposConsultoria = signal<State>({
    tipos: [],
  });

  public tiposRequerimiento = computed(() => this.#tiposRequerimiento().tipos);
  public tiposEstado = computed(() => this.#tiposEstado().tipos);
  public tiposConsultoria = computed(() => this.#tiposConsultoria().tipos);

  constructor() {
    this.listarTipos(1);
    this.listarTipos(2);
    this.listarTipos(3);
  }


  listarTipos(idTipo: number): void {
    let params = new HttpParams()
      .append('idTipo', `${idTipo}`)
      .append('page', 0)
      .append('results', 0)

    this.http.get<ResponseModel>(`${environment.api}/TipoContenido/ListarContenido`, { params }).subscribe(
      {
        next: (v) => {
          switch (idTipo) {
            case 1:
              this.#tiposRequerimiento.set({
                tipos: v.data,
              });

              break;
            case 2:
              this.#tiposEstado.set({
                tipos: v.data,
              });

              break;
            case 3:
              this.#tiposConsultoria.set({
                tipos: v.data,
              });

              break;

            default:
              break;
          }
        },
        error: (e) => console.error(e),
      }
    );
  }
}
