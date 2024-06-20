import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '../../../../environments/environment.development';
import { ResponseModel } from '../../models/shared/response.model';
import { SelectModel } from '../../models/shared/select.model';

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
        next: (v) => {
          if (v.data == null) return;

          let departamentosRes: SelectModel[] = [];

          v.data.forEach((x: any) => {
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

  listarProvincias(idDep: number, tipo: number = 1): void {
    let params = new HttpParams();

    params = (idDep !== null) ? params.append('departamento', `${idDep}`) : params;
    params = (tipo !== null) ? params.append('tipo', `${tipo}`) : params;

    this.http.get<ResponseModel>(`${environment.api}/Ubigeo/ListarProvincia?departamento=${idDep}&tipo=${tipo}`, { params }).subscribe(
      {
        next: (v) => {
          if (v.data == null) return;

          let provinciasRes: SelectModel[] = [];

          v.data.forEach((x: any) => {
            provinciasRes.push(new SelectModel(Number(x.provinciaId), x.provincia));
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
