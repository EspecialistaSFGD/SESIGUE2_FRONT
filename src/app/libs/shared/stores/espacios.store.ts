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


  listarEventos(estado: number = 1, vigente: number = 1, pageIndex: number | null = 1, pageSize: number | null = 100, sortField: string | null = 'eventoId', sortOrder: string | null = 'descend'): void {
    let params = new HttpParams()
      .append('estado', `${estado}`)
      .append('vigente', `${vigente}`)
      .append('piCurrentPage', `${pageIndex}`)
      .append('piPageSize', `${pageSize}`)
      .append('columnSort', `${sortField}`)
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

          let espaciosRes: SelectModel[] = [];
          let espacioSeleccionado: SelectModel | null = null;

          eventos.forEach((evento) => {
            if (evento.fechaEvento) {
              evento.fechaEvento = this.utilesService.stringToDate(evento.fechaEvento.toString());
            }

            espaciosRes.push(new SelectModel(Number(evento.eventoId), evento.nombre, evento.fechaEvento));
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
