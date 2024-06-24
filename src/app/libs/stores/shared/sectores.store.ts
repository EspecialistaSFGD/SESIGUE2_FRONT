import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '../../../../environments/environment.development';
import { ResponseModel } from '../../models/shared/response.model';
import { SelectModel } from '../../models/shared/select.model';
import { SectorModel } from '../../models/shared/sector.model';

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


  listarSectores(id: number = 0, tipo: number = 2): void {
    let params = new HttpParams()
      .append('grupoId', `${id}`)
      .append('tipo', `${tipo}`)
      ;

    this.http.get<ResponseModel>(`${environment.api}/Sector`, { params }).subscribe(
      {
        next: (v: ResponseModel) => {
          const res: SectorModel[] = v.data;
          if (res == null) return;

          let sectoresRes: SelectModel[] = [];

          v.data.forEach((x: SectorModel) => {
            sectoresRes.push(new SelectModel(Number(x.grupoID), x.nombre));
          });

          this.#sectoresResult.set({
            sectores: sectoresRes,
          });
        },
        error: (e) => console.error(e),
      }
    );
  }
}
