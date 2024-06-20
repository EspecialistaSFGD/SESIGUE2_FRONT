import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '../../../../environments/environment.development';
import { ResponseModel } from '../../models/shared/response.model';
import { SelectModel } from '../../models/shared/select.model';

interface State {
  sectores: SelectModel[];
}

@Injectable({
  providedIn: 'root'
})
export class SectoresStore {

  public msg = inject(NzMessageService);
  public http = inject(HttpClient);

  #sectoresResult = signal<State>({
    sectores: [],
  });

  public sectores = computed(() => this.#sectoresResult().sectores);

  constructor() {
    this.listarSectores();
  }


  listarSectores(id: number = 0, tipo: number = 0): void {
    let params = new HttpParams()
      .append('grupoId', `${id}`)
      .append('tipo', `${tipo}`)
      ;

    this.http.get<ResponseModel>(`${environment.api}/Sector?grupoId=${id}&tipo=${tipo}`, { params }).subscribe(
      {
        next: (v) => {
          if (v.data == null) return;

          let sectoresRes: SelectModel[] = [];

          v.data.forEach((x: any) => {
            sectoresRes.push(new SelectModel(Number(x.grupoID), x.nombre));
          });

          this.#sectoresResult.set({
            sectores: sectoresRes,
          });

          // console.log(v.data);

        },
        error: (e) => console.error(e),
      }
    );
  }
}
