import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '../../../../environments/environment.development';
import { ResponseModel, ResponseModelPaginated } from '../../models/shared/response.model';
import { SelectModel } from '../../models/shared/select.model';
import { EspacioModel } from '../../models/shared/espacio.model';
import { UtilesService } from '../services/utiles.service';

interface State {
  espacios: SelectModel[];
  espacioSeleccionado?: SelectModel | null;
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
  });

  public espacios = computed(() => this.#espaciosResult().espacios);
  public espacioSeleccionado = computed(() => this.#espaciosResult().espacioSeleccionado);

  constructor() {
    this.listarEventos();
  }

  // listarEspacios(id: number = 0, tipo: number = 0): void {
  //   let params = new HttpParams()
  //     .append('eventoId', `${id}`)
  //     .append('tipo', `${tipo}`);

  //   this.http.get<ResponseModel>(`${environment.api}/Evento`, { params }).subscribe(
  //     {
  //       next: (v: ResponseModel) => {
  //         const res: EspacioModel[] = v.data;
  //         let espaciosRes: SelectModel[] = [];
  //         let espacioSeleccionado: SelectModel | null = null;

  //         if (res == null) return;
  //         res.forEach((x: EspacioModel) => {
  //           espaciosRes.push(new SelectModel(Number(x.eventoId), x.nombre));

  //           if (x.vigente == 1 && espacioSeleccionado == null) {
  //             espacioSeleccionado = new SelectModel(Number(x.eventoId), x.nombre);
  //           }
  //         });

  //         this.#espaciosResult.set({
  //           espacios: espaciosRes,
  //           espacioSeleccionado: espacioSeleccionado,
  //         });
  //       },
  //       error: (e) => console.error(e),
  //     }
  //   );
  // }

  listarEventos(estado: number = 1, vigente: number = 1, pageIndex: number | null = 1, pageSize: number | null = 100, sortField: string | null = 'eventoId', sortOrder: string | null = 'descend'): void {
    let params = new HttpParams()
      .append('estado', `${estado}`)
      .append('piCurrentPage', `${pageIndex}`)
      .append('piPageSize', `${pageSize}`)
      .append('columnSort', `${sortField}`)
      .append('vigente', `${vigente}`)
      .append('typeSort', `${sortOrder}`);

    this.#espaciosResult.update((state) => ({
      ...state,
      isLoading: true,
    }));

    this.http.get<ResponseModelPaginated>(`${environment.api}/Evento/ListarEvento`, { params })
      .subscribe({
        next: (data) => {

          const eventos: EspacioModel[] = data.data;

          if (!eventos) return;

          const res: EspacioModel[] = data.data;
          // console.log(res);
          //TODO: capturar fecha de eventos para manejarlos en el front de pedidos

          let espaciosRes: SelectModel[] = [];
          let espacioSeleccionado: SelectModel | null = null;

          eventos.forEach((evento) => {
            if (evento.fechaEvento) {
              evento.fechaEvento = this.utilesService.stringToDate(evento.fechaEvento.toString());
            }

            espaciosRes.push(new SelectModel(Number(evento.eventoId), evento.nombre, evento.fechaEvento));
            //TODO: verificar si es necesario
            // if (evento.vigente == 1 && espacioSeleccionado == null) {
            //   espacioSeleccionado = new SelectModel(Number(evento.eventoId), evento.nombre);
            // }
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

}
