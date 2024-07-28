import { Injectable, computed, inject, signal } from '@angular/core';
import { BaseHttpService } from '../../shared/base-http.service';
import { EspacioModel, EspacioResponseModel } from '../../models/shared/espacio.model';
import { ResponseModel, ResponseModelPaginated } from '../../models/shared/response.model';
import { HttpParams } from '@angular/common/http';
import { UtilesService } from '../../shared/services/utiles.service';

interface State {
  eventos: EspacioResponseModel[] | null;
  eventoSeleccionado: any | EspacioModel | null | undefined;
  isLoading: boolean;
  isEditing: boolean;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class EspaciosService extends BaseHttpService {

  private utilesService = inject(UtilesService);

  #espaciosResult = signal<State>(
    {
      eventos: [],
      eventoSeleccionado: null,
      isLoading: true,
      isEditing: false,
      total: 0,
    } as State);

  public eventos = computed(() => this.#espaciosResult().eventos);
  public eventoSeleccionado = computed(() => this.#espaciosResult().eventoSeleccionado);
  public isLoading = computed(() => this.#espaciosResult().isLoading);
  public isEditing = computed(() => this.#espaciosResult().isEditing);
  public total = computed(() => this.#espaciosResult().total);

  listarEventos(estado: number = 1, pageIndex: number | null = 1, pageSize: number | null = 10, sortField: string | null = 'eventoId', sortOrder: string | null = 'descend'): void {
    let params = new HttpParams()
      .append('estado', `${estado}`)
      .append('piCurrentPage', `${pageIndex}`)
      .append('piPageSize', `${pageSize}`)
      .append('columnSort', `${sortField}`)
      .append('typeSort', `${sortOrder}`);

    this.#espaciosResult.update((state) => ({
      ...state,
      isLoading: true,
    }));

    this.http.get<ResponseModelPaginated>(`${this.apiUrl}/Evento/ListarEvento`, { params })
      .subscribe({
        next: (data) => {

          const eventos: EspacioModel[] = data.data;

          if (!eventos) return;

          eventos.forEach((evento) => {
            if (evento.fechaEvento) {
              evento.fechaEvento = this.utilesService.stringToDate(evento.fechaEvento.toString());
            }

            if (evento.fechaRegistro) {
              evento.fechaRegistro = this.utilesService.stringToDate(evento.fechaRegistro.toString());
            }

            if (evento.descripcionEstado && evento.estado) {
              evento.estadoSelect = { value: evento.estado, label: evento.descripcionEstado };
            }

            if (evento.vigente) {
              evento.vigente = true;
            } else {
              evento.vigente = false;
            }
          });


          this.#espaciosResult.update((state) => ({
            ...state,
            eventos: data.data,
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

  agregarEvento(evento: EspacioModel): Promise<ResponseModel> {
    return new Promise((resolve, reject) => {
      this.#espaciosResult.update((state) => ({
        ...state,
        isEditing: true,
      }));

      const ots: EspacioResponseModel = {} as EspacioResponseModel;

      if (evento.eventoId) ots.eventoId = evento.eventoId;
      ots.nombre = evento.nombre;
      ots.abreviatura = evento.abreviatura;
      ots.vigente = (evento.vigente) ? 1 : 0;
      ots.orden = Number(evento.orden);
      if (evento.subTipo) ots.subTipo = evento.subTipo;
      if (evento.estadoSelect) ots.estado = Number(evento?.estadoSelect['value']);
      if (evento.fechaEvento) ots.fechaEvento = new Date(evento.fechaEvento);
      if (evento.fechaRegistro) ots.fechaRegistro = new Date(evento.fechaRegistro);

      this.http.post(`${this.apiUrl}/Evento/RegistrarEvento`, ots)
        .subscribe({
          next: (data: ResponseModel) => {
            this.msg.success(data.message);
            this.listarEventos();
            resolve(data);
          },
          error: (err) => {
            this.msg.error(err.error.message);
            reject(err);
          },
          complete: () => {
            this.#espaciosResult.update((state) => ({
              ...state,
              isEditing: false,
            }));
          }
        });

    });
  }

  eliminarEvento(eventoId: number): Promise<ResponseModel> {
    return new Promise((resolve, reject) => {
      this.#espaciosResult.update((state) => ({
        ...state,
        isEditing: true,
      }));

      this.http.post(`${this.apiUrl}/Evento/EliminarEvento`, { eventoId })
        .subscribe({
          next: (data: ResponseModel) => {
            this.msg.success(data.message);
            this.listarEventos();
            resolve(data);
          },
          error: (err) => {
            this.msg.error(err.error.message);
            reject(err);
          },
          complete: () => {
            this.#espaciosResult.update((state) => ({
              ...state,
              isEditing: false,
            }));
          }
        });
    });
  }

  iniciarEvento(eventoId: number): Promise<ResponseModel> {
    return new Promise((resolve, reject) => {
      this.#espaciosResult.update((state) => ({
        ...state,
        isEditing: true,
      }));

      this.http.post(`${this.apiUrl}/Evento/IniciarEvento`, { eventoId })
        .subscribe({
          next: (data: ResponseModel) => {
            this.msg.success(data.message);
            this.listarEventos();
            resolve(data);
          },
          error: (err) => {
            this.msg.error(err.error.message);
            reject(err);
          },
          complete: () => {
            this.#espaciosResult.update((state) => ({
              ...state,
              isEditing: false,
            }));
          }
        });
    });
  }

  iniciarSeguimientoEvento(eventoId: number): Promise<ResponseModel> {
    return new Promise((resolve, reject) => {
      this.#espaciosResult.update((state) => ({
        ...state,
        isEditing: true,
      }));

      this.http.post(`${this.apiUrl}/Evento/SeguimientoEvento`, { eventoId })
        .subscribe({
          next: (data: ResponseModel) => {
            this.msg.success(data.message);
            this.listarEventos();
            resolve(data);
          },
          error: (err) => {
            this.msg.error(err.error.message);
            reject(err);
          },
          complete: () => {
            this.#espaciosResult.update((state) => ({
              ...state,
              isEditing: false,
            }));
          }
        });
    });
  }

  finalizarSeguimientoEvento(eventoId: number): Promise<ResponseModel> {
    return new Promise((resolve, reject) => {
      this.#espaciosResult.update((state) => ({
        ...state,
        isEditing: true,
      }));

      this.http.post(`${this.apiUrl}/Evento/FinalizarSeguimientoEvento`, { eventoId })
        .subscribe({
          next: (data: ResponseModel) => {
            this.msg.success(data.message);
            this.listarEventos();
            resolve(data);
          },
          error: (err) => {
            this.msg.error(err.error.message);
            reject(err);
          },
          complete: () => {
            this.#espaciosResult.update((state) => ({
              ...state,
              isEditing: false,
            }));
          }
        });
    });
  }

  seleccionarEventoById(eventoId: number | null | undefined): void {
    if (eventoId !== null && eventoId !== undefined) {
      const evento = this.#espaciosResult().eventos?.find((e) => e.eventoId === eventoId) || null;
      this.#espaciosResult.update((v) => ({ ...v, eventoSeleccionado: evento }));
    } else {
      this.#espaciosResult.update((v) => ({ ...v, eventoSeleccionado: null }));
    }
  }
}
