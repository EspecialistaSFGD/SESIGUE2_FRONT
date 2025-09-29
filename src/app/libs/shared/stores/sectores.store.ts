import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
// import { environment } from '../../../../environments/environment.development';
import { ResponseModel } from '../../models/shared/response.model';
import { SelectModel } from '../../models/shared/select.model';
import { SectorModel } from '../../models/shared/sector.model';
import { EntidadModel } from '../../models/shared/entidad.model';
import { environment } from '@environments/environment';

interface State {
  sectores: SelectModel[];
  tiposEntidades: SelectModel[];
  entidadesResponsables: SelectModel[];
}

@Injectable({
  providedIn: 'root'
})
export class SectoresStore {

  public msg = inject(NzMessageService);
  public http = inject(HttpClient);

  #sectoresResult = signal<State>({
    sectores: [],
    tiposEntidades: [],
    entidadesResponsables: [],
  });

  public sectores = computed(() => this.#sectoresResult().sectores);
  public tiposEntidades = computed(() => this.#sectoresResult().tiposEntidades);
  public entidadesResponsables = computed(() => this.#sectoresResult().entidadesResponsables);

  constructor() {
    this.listarSectores();
    this.listarTiposEntidades();
  }

  listarTiposEntidades(grupoId: number = 0, tipo: number = 4): void {
    let params = new HttpParams()
      .append('grupoId', `${grupoId}`)
      .append('tipo', `${tipo}`);

    this.http.get<ResponseModel>(`${environment.api}/Sector/ListarSector`, { params }).subscribe(
      {
        next: (v: ResponseModel) => {
          const res: SectorModel[] = v.data;
          if (res == null) return;

          let tiposEntidades: SelectModel[] = [];

          v.data.forEach((x: SectorModel) => {
            tiposEntidades.push(new SelectModel(Number(x.grupoID), x.nombre));
          });

          this.#sectoresResult.set({
            sectores: this.#sectoresResult().sectores,
            tiposEntidades: tiposEntidades,
            entidadesResponsables: this.#sectoresResult().entidadesResponsables,
          });
        },
        error: (e) => console.error(e),
      }
    );
  }

  listarSectores(id: number = 0, tipo: number = 2, slug: number = 0): void {
    let params = new HttpParams()
      .append('grupoId', `${id}`)
      .append('tipo', `${tipo}`)
      .append('slug', slug);

    this.http.get<ResponseModel>(`${environment.api}/Sector/ListarSector`, { params }).subscribe(
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
            tiposEntidades: this.#sectoresResult().tiposEntidades,
            entidadesResponsables: this.#sectoresResult().entidadesResponsables,
          });
        },
        error: (e) => console.error(e),
      }
    );
  }

  listarEntidadesResponsables(tipo: number, acuerdoId: number): void {
    let params = new HttpParams()
      .append('tipo', `${tipo}`)
      .append('acuerdoId', `${acuerdoId}`);

    this.http.get<ResponseModel>(`${environment.api}/Responsable/Listar`, { params }).subscribe(
      {
        next: (v: ResponseModel) => {
          const res: EntidadModel[] = v.data;
          if (res == null) return;

          let sectoresRes: SelectModel[] = [];

          v.data.forEach((x: EntidadModel) => {
            sectoresRes.push(new SelectModel(Number(x.entidadId), x.entidad));
          });

          this.#sectoresResult.set({
            sectores: this.#sectoresResult().sectores,
            tiposEntidades: this.#sectoresResult().tiposEntidades,
            entidadesResponsables: sectoresRes,
          });
        },
        error: (e) => console.error(e),
      }
    );
  }
}
