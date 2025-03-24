import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
// import { environment } from '../../../../environments/environment.development';
import { ResponseModel, ResponseModelPaginated } from '../../models/shared/response.model';
import { SelectModel } from '../../models/shared/select.model';
import { EspacioModel, TipoEventoModel } from '../../models/shared/espacio.model';
import { UtilesService } from '../services/utiles.service';
import { environment } from '@environments/environment';

interface State {
  espacios: SelectModel[];
  espacioSeleccionado?: SelectModel | null;
  tiposEspacio: SelectModel[];
  tipoEspacioSeleccionado?: SelectModel | null;
}

@Injectable({
  providedIn: 'root'
})
export class EspaciosStore {

  public msg = inject(NzMessageService);
  public http = inject(HttpClient);
  public utilesService = inject(UtilesService);

  #espaciosResult = signal<State>({
    espacios: [],
    espacioSeleccionado: null,
    tiposEspacio: [],
    tipoEspacioSeleccionado: null,
  });

  public espacios = computed(() => this.#espaciosResult().espacios);
  public espacioSeleccionado = computed(() => this.#espaciosResult().espacioSeleccionado);
  public tiposEspacio = computed(() => this.#espaciosResult().tiposEspacio);
  public tipoEspacioSeleccionado = computed(() => this.#espaciosResult().tipoEspacioSeleccionado);

  constructor() {
    // this.listarEventos();
    this.listarTiposEvento();
  }

  obtenerEventos(codigoTipoEvento: number[] | null = null, estado: number = 1, vigentes: number[] = [1, 2, 3], pageIndex: number | null = 1, pageSize: number | null = 100, sortField: string | null = 'eventoId', sortOrder: string | null = 'descend') {
    let params = new HttpParams()
      .append('estado', `${estado}`)
      // .append('vigente', `${vigente}`)
      .append('piCurrentPage', `${pageIndex}`)
      .append('piPageSize', `${pageSize}`)
      .append('columnSort', `${sortField}`)
      .append('typeSort', `${sortOrder}`);

    for (let vigente of vigentes) {
      params = params.append('vigentes[]', `${vigente}`);
    }
    // if (codigoTipoEvento != null) params = params.append('codigoTipoEvento', `${codigoTipoEvento}`);
    if (codigoTipoEvento != null){
      for (let tipo of codigoTipoEvento) {
        params = params.append('codigoTipoEvento[]', `${tipo}`);
      }
    }

    return this.http.get<ResponseModelPaginated>(`${environment.api}/Evento/ListarEvento`, { params })
  }

  listarEventos(codigoTipoEvento: number[] | null = null, estado: number = 1, vigentes: number[] = [1, 2, 3], pageIndex: number | null = 1, pageSize: number | null = 100, sortField: string | null = 'eventoId', sortOrder: string | null = 'descend'): void {
    let params = new HttpParams()
      .append('estado', `${estado}`)
      // .append('vigente', `${vigente}`)
      .append('piCurrentPage', `${pageIndex}`)
      .append('piPageSize', `${pageSize}`)
      .append('columnSort', `${sortField}`)
      .append('typeSort', `${sortOrder}`);

    for (let vigente of vigentes) {
      params = params.append('vigentes[]', `${vigente}`);
    }

    // if (codigoTipoEvento != null) params = params.append('codigoTipoEvento', `${codigoTipoEvento}`);
    if (codigoTipoEvento != null){
      for (let tipo of codigoTipoEvento) {
        params = params.append('codigoTipoEvento[]', `${tipo}`);
      }
    }

    this.#espaciosResult.update((state) => ({
      ...state,
      isLoading: true,
    }));

    this.http.get<ResponseModelPaginated>(`${environment.api}/Evento/ListarEvento`, { params })
      .subscribe({
        next: (data) => {
          const eventos: EspacioModel[] = data.data;

          // console.log(data);

          if (!eventos) return;

          const res: EspacioModel[] = data.data;

          let espaciosRes: SelectModel[] = [];
          let espacioSeleccionado: SelectModel | null = null;

          eventos.forEach((evento) => {

            if (evento.fechaEvento) {
              evento.fechaEvento = this.utilesService.stringToDate(evento.fechaEvento.toString());
            }

            espaciosRes.push(new SelectModel(Number(evento.eventoId), evento.nombre, evento.fechaEvento, evento.subTipo));
          });


          this.#espaciosResult.update((state) => ({
            ...state,
            espacios: espaciosRes,
            espacioSeleccionado: espacioSeleccionado,
            total: data.info.total,
            isLoading: false,
          }));
        },
        error: (err) => {
          this.msg.error(err.error.message);
          this.#espaciosResult.update((state) => ({
            ...state,
            isLoading: false,
          }));
        }
      });
  }

  listarTiposEvento(columnSort: string = 'codigoTipoEvento', TypeSort: string = 'descend', piPageSize: number = 10, piCurrentPage: number = 1): void {

    let params = new HttpParams()
      .append('columnSort', `${columnSort}`)
      .append('TypeSort', `${TypeSort}`)
      .append('piPageSize', `${piPageSize}`)
      .append('piCurrentPage', `${piCurrentPage}`);

    this.http.get<ResponseModelPaginated>(`${environment.api}/TipoEvento/Listar`, { params })
      .subscribe({
        next: (data) => {

          // console.log(data);


          const tiposEvento: TipoEventoModel[] = data.data;

          if (!tiposEvento) return;

          const res: TipoEventoModel[] = data.data;

          let espaciosRes: SelectModel[] = [];
          let espacioSeleccionado: SelectModel | null = null;

          tiposEvento.forEach((evento) => {

            espaciosRes.push(new SelectModel(Number(evento.codigoTipoEvento), evento.descripcionTipoEvento));
          });

          this.#espaciosResult.update((state) => ({
            ...state,
            tiposEspacio: espaciosRes,
            tipoEspacioSeleccionado: espacioSeleccionado,
            isLoading: false,
          }));
        },
        error: (err) => {
          this.msg.error(err.error.message);
          this.#espaciosResult.update((state) => ({
            ...state,
            isLoading: false,
          }));
        }
      });
  }
}
