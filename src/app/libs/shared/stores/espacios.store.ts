import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '../../../../environments/environment.development';
import { ResponseModel } from '../../models/shared/response.model';
import { SelectModel } from '../../models/shared/select.model';
import { EspacioModel } from '../../models/shared/espacio.model';

interface State {
  espacios: SelectModel[];
}

@Injectable({
  providedIn: 'root'
})
export class EspaciosStore {

  public msg = inject(NzMessageService);
  public http = inject(HttpClient);

  #espaciosResult = signal<State>({
    espacios: [],
  });

  public espacios = computed(() => this.#espaciosResult().espacios);

  constructor() {
    this.listarEspacios();
  }


  listarEspacios(id: number = 0, tipo: number = 0): void {
    let params = new HttpParams()
      .append('eventoId', `${id}`)
      .append('tipo', `${tipo}`)
      ;

    this.http.get<ResponseModel>(`${environment.api}/Evento`, { params }).subscribe(
      {
        next: (v: ResponseModel) => {
          const res: EspacioModel[] = v.data;
          let espaciosRes: SelectModel[] = [];

          if (res == null) return;
          res.forEach((x: EspacioModel) => {
            espaciosRes.push(new SelectModel(Number(x.eventoId), x.nombre));
          });

          this.#espaciosResult.set({
            espacios: espaciosRes,
          });
        },
        error: (e) => console.error(e),
      }
    );
  }
}
