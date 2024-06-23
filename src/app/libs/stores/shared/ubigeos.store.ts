import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '../../../../environments/environment.development';
import { ResponseModel } from '../../models/shared/response.model';
import { SelectModel } from '../../models/shared/select.model';
import { DepartamentoModel, ProvinciaModel } from '../../models/shared/ubigeo.model';

interface State {
  departamentos: SelectModel[];
  provincias?: SelectModel[];
}

@Injectable({
  providedIn: 'root'
})
export class UbigeosStore {

  public msg = inject(NzMessageService);
  public http = inject(HttpClient);

  #ubigeosResult = signal<State>({
    departamentos: [],
    provincias: [],
  });

  public departamentos = computed(() => this.#ubigeosResult().departamentos);
  public provincias = computed(() => this.#ubigeosResult().provincias);

  constructor() {
    this.listarDepartamentos();
  }


  listarDepartamentos(): void {
    this.http.get<ResponseModel>(`${environment.api}/Ubigeo/ListarDepartamento`).subscribe(
      {
        next: (v: ResponseModel) => {
          const res: DepartamentoModel[] = v.data;
          if (res == null) return;

          let departamentosRes: SelectModel[] = [];

          res.forEach((x: DepartamentoModel) => {
            departamentosRes.push(new SelectModel(Number(x.departamentoId), x.departamento));
          });

          this.#ubigeosResult.set({
            departamentos: departamentosRes,
            provincias: this.#ubigeosResult().provincias,
          });
        },
        error: (e) => console.error(e),
      }
    );
  }

  listarProvincias(idDep: number, tipo: number = 0): void {
    let params = new HttpParams();

    params = (idDep !== null) ? params.append('departamento', `${idDep}`) : params;
    params = (tipo !== null) ? params.append('tipo', `${tipo}`) : params;

    this.http.get<ResponseModel>(`${environment.api}/Ubigeo/ListarProvincia`, { params }).subscribe(
      {
        next: (v) => {
          const res: ProvinciaModel[] = v.data;
          if (res == null) return;

          let provinciasRes: SelectModel[] = [];

          res.forEach((x: ProvinciaModel) => {
            provinciasRes.push(new SelectModel(x.provinciaId, x.provincia));
          });

          this.#ubigeosResult.set({
            departamentos: this.#ubigeosResult().departamentos,
            provincias: provinciasRes,
          });
        },
        error: (e) => console.error(e),
      }
    );
  }
}
