import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ResponseModel, ResponseModelPaginated } from '../../models/shared/response.model';
import { AvanceHitoModel } from '../../models/pedido';
import { UtilesService } from '../../shared/services/utiles.service';
import { SelectModel } from '../../models/shared/select.model';
import { ComentarioAvanceModel, ComentarioModel } from '../../models/pedido/comentario.model';
import { AvanceHitoRequestModel } from '@libs/models/pedido/avance.model';
const accesoId = localStorage.getItem('codigoUsuario') || null;
const codigoSubTipo = localStorage.getItem('codigoSubTipo') || null;
const codigoNivel = localStorage.getItem('codigoNivel') || null;

interface State {
    avances: any[];
    avanceSeleccionado: any | null | undefined;
    isLoading: boolean;
    isEditing: boolean;
    total: number;
    sortField: string | null;
    sortOrder: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class AvancesService {

    public msg = inject(NzMessageService);
    public http = inject(HttpClient);
    private utilesService = inject(UtilesService);

    #avancesResult = signal<State>({
        avances: [],
        avanceSeleccionado: null,
        isLoading: true,
        isEditing: false,
        total: 0,
        sortField: null,
        sortOrder: null,
    });

    public avances = computed(() => this.#avancesResult().avances);
    public avanceSeleccionado = computed(() => this.#avancesResult().avanceSeleccionado);
    public isLoading = computed(() => this.#avancesResult().isLoading);
    public isEditing = computed(() => this.#avancesResult().isEditing);
    public total = computed(() => this.#avancesResult().total);

    constructor() { }

    agregarEditarAvance(avance: AvanceHitoModel): Promise<ResponseModel> {
        // console.log(avance);

        // return new Promise((resolve, reject) => {

        // });
        return new Promise((resolve, reject) => {
            this.#avancesResult.update((state) => ({
                ...state,
                isEditing: true,
            }));

            let formData: FormData = new FormData();

            if (avance.avanceId != null) formData.append('avanceId', `${avance.avanceId}`);
            formData.append('hitoId', `${avance.hitdoId}`);

            if (avance.fecha) {
                const fechaE = new Date(avance.fecha);
                formData.append('fecha', `${fechaE.toISOString()}`);
            }
            formData.append('estadoRegistroHito', `${avance.estado}`);
            formData.append('avance', `${avance.avance}`);

            if (avance.idEvidencia != null) formData.append('IdEvidencia', avance.idEvidencia);

            // Asegúrate de que evidencia no sea undefined
            if (avance.idEvidencia === null && avance.evidencia !== null && avance.evidencia !== undefined) {
                formData.append('evidencia', avance.evidencia, avance.evidencia.name);
            }

            if (avance.entidadSelect != null) formData.append('entidadID', `${avance.entidadSelect?.value}`);

            formData.append('accesoId', `${accesoId}`);
            formData.append('codigoSubTipo', `${codigoSubTipo}`);
            formData.append('codigoNivel', `${codigoNivel}`);

            this.http.post(`${environment.api}/Avance/RegistrarAvance`, formData).subscribe({
                next: (data: ResponseModel) => {
                    this.msg.success(data.message);
                    // this.listarAvances(avance.hitdoId, 1, 10, 'avanceId', 'ascend');
                    resolve(data);
                },
                error: (e) => {
                    this.msg.error(`Error al agregar hito: ${e}`);
                    reject(e);
                },
                complete: () => this.#avancesResult.update((v) => ({ ...v, isEditing: false })),
            });
        });
    }

    listarAvances(hitoID: number | null = null, pageIndex: number | null = 1, pageSize: number | null = 10, sortField: string | null = null, sortOrder: string | null = null): void {
        let params = new HttpParams();

        this.#avancesResult.update((state) => ({
            ...state,
            isLoading: true,
        }));

        params = (hitoID !== null) ? params.append('hitoID', `${hitoID}`) : params;
        params = (pageIndex !== null) ? params.append('piCurrentPage', `${pageIndex}`) : params;
        params = (pageSize !== null) ? params.append('piPageSize', `${pageSize}`) : params;
        params = (sortField !== null) ? params.append('columnSort', `${sortField}`) : params;
        params = (sortOrder !== null) ? params.append('typeSort', `${sortOrder}`) : params;

        this.http.get<ResponseModelPaginated>(`${environment.api}/Avance/Listar`, { params }).subscribe({
            next: (data) => {
                // console.log(data);

                this.#avancesResult.update((v) => ({ ...v, avances: data.data, isLoading: false, total: data.info.total }));
            },
            error: (e) => console.log(e),
            complete: () => this.#avancesResult.update((v) => ({ ...v, isLoading: false })),
        });
    }

    validarAvance(avance: AvanceHitoModel): void {
        const avanceRequest: AvanceHitoModel = new AvanceHitoModel();
        avanceRequest.avanceId = avance.avanceId;

        if (accesoId != null) avanceRequest.accesoId = Number(accesoId);

        this.http.post(`${environment.api}/Avance/ValidarAvance`, avanceRequest).subscribe({
            next: (data) => {
                this.msg.success('Avance validado correctamente');
                this.listarAvances(avance.hitdoId, 1, 10, 'avanceId', 'ascend');
            },
            error: (e) => {
                this.msg.error(`Error al validar avance: ${e}`);
            },
        });
    }

    descargarEvidenciaAvance(avanceId: number): Promise<ResponseModel> {
        return new Promise((resolve, reject) => {
            this.http.get(`${environment.api}/Avance/Descargar?avanceId=${avanceId}`).subscribe({
                next: (data: ResponseModel) => {
                    resolve(data);
                },
                error: (e) => {
                    reject(e);
                },
            });
        });
    }

    agregarComentario(comentario: ComentarioModel): Promise<ResponseModel> {
        const ots = new ComentarioAvanceModel();
        ots.avanceId = comentario.id;
        ots.comentario = comentario.comentario;
        ots.accesoId = Number(accesoId);
        ots.tipoComentario = comentario.tipoComentario;

        return new Promise((resolve, reject) => {
            this.http.post(`${environment.api}/Avance/ComentarioAvance`, ots).subscribe({
                next: (data: ResponseModel) => {
                    this.msg.success('Comentario agregado correctamente');
                    this.listarAvances(this.avanceSeleccionado().hitdoId, 1, 10, 'avanceId', 'ascend');
                    resolve(data);
                },
                error: (e) => {
                    this.msg.error(`Error al agregar comentario: ${e}`);
                    reject(e);
                },
            });
        });
    }

    agregarComentarioDesdeListadoHitos(comentario: ComentarioModel): Promise<ResponseModel> {
        const ots = new ComentarioAvanceModel();
        ots.avanceId = comentario.id;
        ots.comentario = comentario.comentario;
        ots.accesoId = Number(accesoId);
        ots.tipoComentario = comentario.tipoComentario;

        return new Promise((resolve, reject) => {
            this.http.post(`${environment.api}/Avance/ComentarioAvance`, ots).subscribe({
                next: (data: ResponseModel) => {
                    this.msg.success('Comentario agregado correctamente');
                    // this.listarAvances(this.avanceSeleccionado().hitdoId, 1, 10, 'avanceId', 'ascend');
                    resolve(data);
                },
                error: (e) => {
                    this.msg.error(`Error al agregar comentario: ${e}`);
                    reject(e);
                },
            });
        });
    }

    eliminarAvance(avance: AvanceHitoModel): Promise<ResponseModel> {
        this.#avancesResult.update((state) => ({
            ...state,
            isEditing: true,
        }));

        const hitoRequest: AvanceHitoRequestModel = new AvanceHitoRequestModel();
        hitoRequest.avanceId = avance.avanceId;

        if (accesoId != null) hitoRequest.accesoId = Number(accesoId);

        return new Promise((resolve, reject) => {
            this.http.post(`${environment.api}/Avance/DesestimarAvance`, hitoRequest).subscribe({
                next: (data) => {
                    this.msg.success('Avance eliminado correctamente');
                    // this.listarHitos(hito.acuerdoID, null, 1, 10, 'hitoId', 'ascend');
                    resolve(data);
                },
                error: (e) => {
                    this.msg.error(`Error al eliminar Avance: ${e}`);
                    reject(e);
                },
                complete: () => this.#avancesResult.update((state) => ({
                    ...state,
                    isEditing: false,
                })),
            });
        })

    }

    seleccionarAvanceById(avanceId: number | undefined | null): void {
        if (avanceId != null && avanceId != undefined) {
            const avance = this.#avancesResult().avances.find((avance: AvanceHitoModel) => avance.avanceId === avanceId) || null;

            if (avance != null && avance.fecha != null && avance.fecha != undefined) {
                avance.fechaDate = this.utilesService.stringToDate(avance.fecha);
            }

            if (avance != null && avance.entidadID != null && avance.entidadID != undefined) {
                avance.entidadSelect = new SelectModel(Number(avance.entidadID));
            }

            this.#avancesResult.update((v) => ({ ...v, avanceSeleccionado: avance }));
        } else {
            this.#avancesResult.update((v) => ({ ...v, avanceSeleccionado: null }));
        }


        // if (avance != null && avance.entidadID != null && avance.entidadID != undefined) {
        //     avance.entidadSelect = new SelectModel(Number(avance.entidadID));
        // }

        // this.#avancesResult.update((v) => ({ ...v, avanceSeleccionado: avance }));
    }
}
