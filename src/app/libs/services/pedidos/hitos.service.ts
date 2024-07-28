import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { SelectModel } from '../../models/shared/select.model';
import { environment } from '../../../../environments/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ResponseModel, ResponseModelPaginated } from '../../models/shared/response.model';
import { HitoAcuerdoModel } from '../../models/pedido';
import { UtilesService } from '../../shared/services/utiles.service';
import { ComentarioHitoModel, ComentarioSDHitoModel } from '../../models/pedido/comentario.model';
import { HitoAcuerdoRequestModel } from '../../models/pedido/hito.model';
import { Observable, of } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';
const accesoId = localStorage.getItem('codigoUsuario') || null;

interface State {
    hitos: any[];
    hitoSeleccionado: any | null | undefined;
    isLoading: boolean;
    isEditing: boolean;
    total: number;
    sortField: string | null;
    sortOrder: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class HitosService {

    public msg = inject(NzMessageService);
    public http = inject(HttpClient);
    private utilesService = inject(UtilesService);

    #hitosResult = signal<State>({
        hitos: [],
        hitoSeleccionado: null,
        isLoading: true,
        isEditing: false,
        total: 0,
        sortField: null,
        sortOrder: null,
    });

    public hitos = computed(() => this.#hitosResult().hitos);
    public isLoading = computed(() => this.#hitosResult().isLoading);
    public isEditing = computed(() => this.#hitosResult().isEditing);
    public hitoSeleccionado = computed(() => this.#hitosResult().hitoSeleccionado);
    public total = computed(() => this.#hitosResult().total);

    constructor() { }

    agregarEditarHito(hito: HitoAcuerdoModel): Promise<ResponseModel> {
        return new Promise((resolve, reject) => {
            this.#hitosResult.update((state) => ({
                ...state,
                isEditing: true,
            }));

            const ots: HitoAcuerdoModel = new HitoAcuerdoModel();
            if (hito.hitoId != null) ots.hitoId = hito.hitoId;
            ots.acuerdoId = hito.acuerdoId;
            ots.hito = hito.hito;
            ots.plazo = hito.plazo;
            ots.responsableId = Number(hito.responsableSelect?.value);
            ots.entidadId = Number(hito.entidadSelect?.value);
            ots.accesoId = Number(accesoId);

            this.http.post(`${environment.api}/Hito/RegistrarHito`, ots).pipe(delay(1000)).subscribe({
                next: (data: ResponseModel) => {
                    this.msg.success(`Hito ${data.data ? 'actualizado' : 'agregado'} correctamente`);
                    this.listarHitos(hito.acuerdoId, data.data, 1, 10, 'hitoId', 'ascend');
                    resolve(data); // Resuelve la promesa cuando la operación es exitosa
                },
                error: (e) => {
                    this.msg.error(`Error al agregar hito: ${e}`);
                    reject(e); // Rechaza la promesa si hay un error
                },
                complete: () => this.#hitosResult.update((state) => ({
                    ...state,
                    isEditing: false,
                })),
            });
        });
    }

    agregarComentarioHito(comentario: ComentarioHitoModel): Promise<ResponseModel> {
        const ots = new ComentarioHitoModel();
        ots.hitoId = comentario.hitoId;
        ots.comentario = comentario.comentario;
        ots.accesoId = Number(accesoId);
        return new Promise((resolve, reject) => {
            this.http.post(`${environment.api}/Hito/ComentarHito`, ots).subscribe({
                next: (data: ResponseModel) => {
                    this.msg.success('Comentario agregado correctamente');
                    this.listarHitos(this.hitoSeleccionado().acuerdoID, data.data);
                    resolve(data);
                },
                error: (e) => {
                    this.msg.error(`Error al agregar comentario: ${e}`);
                    reject(e);
                },
            });
        });
    }

    agregarComentarioSDHito(comentario: ComentarioHitoModel): Promise<ResponseModel> {
        const ots = new ComentarioSDHitoModel();
        ots.hitoId = comentario.hitoId;
        ots.comentarioSD = comentario.comentario;
        ots.accesoId = Number(accesoId);
        return new Promise((resolve, reject) => {
            this.http.post(`${environment.api}/Hito/ComentarHito`, ots).subscribe({
                next: (data: ResponseModel) => {
                    this.msg.success('Comentario SD agregado correctamente');
                    this.listarHitos(this.hitoSeleccionado().acuerdoID, data.data);
                    resolve(data);
                },
                error: (e) => {
                    this.msg.error(`Error al agregar comentario SD: ${e}`);
                    reject(e);
                },
            });
        });
    }

    listarHitos(acuerdoID: number | null = null, hitoID: number | null = null, pageIndex: number | null = 1, pageSize: number | null = 10, sortField: string | null = 'hitoId', sortOrder: string | null = 'ascend'): void {
        // debugger;
        let params = new HttpParams();

        this.#hitosResult.update((state) => ({
            ...state,
            isLoading: true,
        }));

        params = (acuerdoID !== null) ? params.append('acuerdoID', `${acuerdoID}`) : params;
        params = (pageIndex !== null) ? params.append('piCurrentPage', `${pageIndex}`) : params;
        params = (pageSize !== null) ? params.append('piPageSize', `${pageSize}`) : params;
        params = (sortField !== null) ? params.append('columnSort', `${sortField}`) : params;
        params = (sortOrder !== null) ? params.append('typeSort', `${sortOrder}`) : params;

        this.http.get<ResponseModelPaginated>(`${environment.api}/Hito/Listar`, { params }).subscribe({
            next: (data) => {
                const res: HitoAcuerdoModel[] = data.data;

                if (res != null && res.length > 0) {
                    res.forEach((hito: HitoAcuerdoModel) => {
                        if (hito.plazo != null && hito.plazo != undefined) {
                            hito.plazoFecha = this.utilesService.stringToDate(hito.plazo);
                        }

                        if (hito.responsable != null && hito.responsable != undefined && hito.responsableID != null && hito.responsableID != undefined) {
                            hito.responsableSelect = new SelectModel(hito.responsableID, hito.responsable);
                        }

                        if (hito.entidad != null && hito.entidad != undefined && hito.responsableID != null && hito.entidadId != undefined && hito.entidadId != null) {
                            hito.entidadSelect = new SelectModel(hito.entidadId, hito.entidad);
                        }
                    });
                }
                // debugger;
                let hitoSeleccionado: HitoAcuerdoModel | null = null;
                if (hitoID !== null) {
                    hitoSeleccionado = res.find((hito: HitoAcuerdoModel) => hito.hitoId === hitoID) || null;
                    // console.log(hitoSeleccionado);

                }

                this.#hitosResult.update((v) => ({
                    ...v,
                    hitos: res,
                    hitoSeleccionado: hitoSeleccionado,
                    isLoading: false,
                    total: data.info.total,
                }));
            },
            error: (e) => console.log(e),
            complete: () => this.#hitosResult.update((v) => ({ ...v, isLoading: false })),
        });
    }

    reactivarEstadoHito(hito: HitoAcuerdoModel): void {
        const hitoRequest: HitoAcuerdoRequestModel = new HitoAcuerdoRequestModel();
        hitoRequest.hitoId = hito.hitoId;

        if (accesoId != null) hitoRequest.accesoId = Number(accesoId);

        this.http.post(`${environment.api}/Hito/Reactivar`, hitoRequest).subscribe({
            next: (data) => {
                this.msg.success('Hito reactivado correctamente');
                this.listarHitos(hito.acuerdoID, null, 1, 10, 'hitoId', 'ascend');
            },
            error: (e) => {
                this.msg.error(`Error al reactivar hito: ${e}`);
            },
        });
    }

    validarHito(hito: HitoAcuerdoModel): void {
        const hitoRequest: HitoAcuerdoRequestModel = new HitoAcuerdoRequestModel();
        hitoRequest.hitoId = hito.hitoId;
        if (accesoId != null) hitoRequest.accesoId = Number(accesoId);
        this.http.post(`${environment.api}/Hito/ValidarHito`, hitoRequest).subscribe({
            next: (data) => {
                this.msg.success('Hito validado correctamente');
                this.listarHitos(hito.acuerdoID, null, 1, 10, 'hitoId', 'ascend');
            },
            error: (e) => {
                this.msg.error(`Error al validar hito: ${e}`);
            },
        });
    }

    eliminarHito(hito: HitoAcuerdoModel): void {
        const hitoRequest: HitoAcuerdoRequestModel = new HitoAcuerdoRequestModel();
        hitoRequest.hitoId = hito.hitoId;

        if (accesoId != null) hitoRequest.accesoId = Number(accesoId);
        this.http.post(`${environment.api}/Hito/DesestimarHito`, hitoRequest).subscribe({
            next: (data) => {
                this.msg.success('Hito desestimado correctamente');
                this.listarHitos(hito.acuerdoID, null, 1, 10, 'hitoId', 'ascend');
            },
            error: (e) => {
                this.msg.error(`Error al eliminar hito: ${e}`);
            },
        });
    }

    // seleccionarHito(hito: HitoAcuerdoModel | null): void {
    //     this.#hitosResult.update((v) => ({ ...v, hitoSeleccionado: hito }));
    // }

    seleccionarHitoById(hitoId: number | null | undefined): void {
        if (hitoId !== null && hitoId !== undefined) {
            const hito = this.#hitosResult().hitos.find((hito: HitoAcuerdoModel) => hito.hitoId === hitoId) || null;
            this.#hitosResult.update((v) => ({ ...v, hitoSeleccionado: hito }));
        } else {
            this.#hitosResult.update((v) => ({ ...v, hitoSeleccionado: null }));

        }
    }

    onEditIsVisible(isVisible: boolean): void {
        this.#hitosResult.update((v) => ({ ...v, EditIsVisible: isVisible }));
    }
}
