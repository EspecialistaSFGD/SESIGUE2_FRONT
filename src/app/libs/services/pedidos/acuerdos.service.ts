import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { SelectModel } from '../../models/shared/select.model';
import { environment } from '../../../../environments/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ResponseModel, ResponseModelPaginated } from '../../models/shared/response.model';
import { AcuerdoPedidoModel } from '../../models/pedido';
import { UtilesService } from '../../shared/services/utiles.service';
import { AuthService } from '../auth/auth.service';

interface State {
    acuerdos: AcuerdoPedidoModel[];
    acuerdoSeleccionado: AcuerdoPedidoModel | null;
    isLoading: boolean;
    isEditing: boolean;
    isCreatingPreAcuerdo: boolean | null;
    isConverting: boolean | null;
    total: number;
    sortField: string | null;
    sortOrder: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class AcuerdosService {

    public msg = inject(NzMessageService);
    public http = inject(HttpClient);
    private utilesService = inject(UtilesService);
    private authService = inject(AuthService);

    #acuerdosResult = signal<State>({
        acuerdos: [],
        acuerdoSeleccionado: null,
        isLoading: true,
        isEditing: false,
        isCreatingPreAcuerdo: false,
        isConverting: false,
        total: 0,
        sortField: null,
        sortOrder: null,
    });

    public acuerdos = computed(() => this.#acuerdosResult().acuerdos);
    public acuerdoSeleccionado = computed(() => this.#acuerdosResult().acuerdoSeleccionado);
    public isCreatingPreAcuerdo = computed(() => this.#acuerdosResult().isCreatingPreAcuerdo);
    public isConverting = computed(() => this.#acuerdosResult().isConverting);
    public isLoading = computed(() => this.#acuerdosResult().isLoading);
    public isEditing = computed(() => this.#acuerdosResult().isEditing);
    public total = computed(() => this.#acuerdosResult().total);

    constructor() { }

    listarAcuerdos(cui: string | null = null, clasificacion: SelectModel[] | null = null, tipo: SelectModel | null = null, estadoAcuerdo: SelectModel[] | null = null, espacio: SelectModel[] | null = null, sector: SelectModel[] | null = null, dep: SelectModel | null = null, prov: SelectModel | null = null, pageIndex: number | null = 1, pageSize: number | null = 10, sortField: string | null = null, sortOrder: string | null = null): void {
        // debugger;
        let params = new HttpParams();

        this.#acuerdosResult.update((state) => ({
            ...state,
            isLoading: true,
        }));

        params = (cui != null) ? params.append('codigo', `${cui}`) : params;

        if (clasificacion != null && clasificacion.length > 0) {
            clasificacion.forEach((clas: SelectModel) => {
                params = params.append('clasificacionId[]', `${clas.value}`);
            });
        }

        params = (tipo != null) ? params.append('tipoId', `${tipo.value}`) : params;

        if (estadoAcuerdo != null && estadoAcuerdo.length > 0) {
            estadoAcuerdo.forEach((est: SelectModel) => {
                params = params.append('estadoId[]', `${est.value}`);
            });
        }

        if (espacio != null && espacio.length > 0) {
            espacio.forEach((esp: SelectModel) => {
                params = params.append('eventoId[]', `${esp.value}`);
            });
        }

        if (sector != null && sector.length > 0) {
            sector.forEach((esp: SelectModel) => {
                params = params.append('grupoID[]', `${esp.value}`);
            });
        }

        params = (dep !== null && prov === null) ? params.append('ubigeo[]', `${dep.value}`) : params;
        params = (prov !== null) ? params.append('ubigeo[]', `${prov.value}`) : params;
        params = (pageIndex !== null) ? params.append('piCurrentPage', `${pageIndex}`) : params;
        params = (pageSize !== null) ? params.append('piPageSize', `${pageSize}`) : params;
        params = (sortField !== null) ? params.append('columnSort', `${sortField}`) : params;
        params = (sortOrder !== null) ? params.append('typeSort', `${sortOrder}`) : params;

        this.http.get<ResponseModelPaginated>(`${environment.api}/Acuerdo/Listar`, { params }).subscribe({
            next: (data) => {
                // console.log(data.data);

                this.#acuerdosResult.update((v) => ({ ...v, acuerdos: data.data, isLoading: false, total: data.info.total }));
            },
            error: (e) => console.log(e),
            complete: () => this.#acuerdosResult.update((v) => ({ ...v, isLoading: false })),
        });
    }

    listarAcuerdosPorPedido(prioridadID: number | null = null, pageIndex: number | null = 1, pageSize: number | null = 10, sortField: string | null = 'acuerdoID', sortOrder: string | null = 'descend'): void {
        let params = new HttpParams();
        if (prioridadID) params = params.append('prioridadID', `${prioridadID}`);
        params = params.append('piCurrentPage', `${pageIndex}`);
        params = params.append('piPageSize', `${pageSize}`);
        params = params.append('columnSort', `${sortField}`);
        params = params.append('typeSort', `${sortOrder}`);

        this.#acuerdosResult.update((state) => ({
            ...state,
            isLoading: true,
        }));

        this.http.get<ResponseModelPaginated>(`${environment.api}/Acuerdo/Listar`, { params }).subscribe({
            next: (data) => {
                const res: AcuerdoPedidoModel[] = data.data;

                res.forEach((acuerdo) => {
                    if (acuerdo.responsable && acuerdo.responsableId) acuerdo.responsableSelect = new SelectModel(acuerdo.responsableId, acuerdo.responsable);
                    if (acuerdo.entidadId && acuerdo.entidad) acuerdo.entidadSelect = new SelectModel(acuerdo.entidadId, acuerdo.entidad);
                    if (acuerdo.clasificacion && acuerdo.clasificacionId) acuerdo.clasificacionSelect = new SelectModel(acuerdo.clasificacionId, acuerdo.clasificacion);
                    if (acuerdo.tipo && acuerdo.tipoId) acuerdo.tipoSelect = new SelectModel(acuerdo.tipoId, acuerdo.tipo);

                    if (acuerdo.plazo) acuerdo.plazo = this.utilesService.stringToDate(acuerdo.plazo.toString());
                });
                this.#acuerdosResult.update((v) => ({ ...v, acuerdos: res, isLoading: false, total: data.info.total }));
            },
            error: (e) => console.log(e),
            complete: () => this.#acuerdosResult.update((v) => ({ ...v, isLoading: false })),
        });
    }

    listarAcuerdo(acuerdoID: number): void {
        let params = new HttpParams();
        params = params.append('acuerdoID', `${acuerdoID}`);
        params = params.append('piCurrentPage', '1');
        params = params.append('piPageSize', '1');
        params = params.append('columnSort', 'acuerdoID');
        params = params.append('typeSort', 'descend');

        this.#acuerdosResult.update((state) => ({
            ...state,
            isLoading: true,
        }));

        this.http.get<ResponseModelPaginated>(`${environment.api}/Acuerdo/Listar`, { params }).subscribe({
            next: (data: ResponseModelPaginated) => {
                const res: AcuerdoPedidoModel[] = data.data;

                if (res.length === 0) return;

                res.forEach((acuerdo) => {
                    if (acuerdo.responsable && acuerdo.responsableId) {
                        acuerdo.responsableSelect = new SelectModel(acuerdo.responsableId, acuerdo.responsable);
                        acuerdo.entidadSelect = new SelectModel(acuerdo.entidadId, acuerdo.entidad);
                    }
                });



                this.#acuerdosResult.update((v) => ({ ...v, acuerdoSeleccionado: res[0], isLoading: false }));
                // console.log(this.acuerdoSeleccionado());
            },
            error: (e) => console.log(e),
            complete: () => this.#acuerdosResult.update((v) => ({ ...v, isLoading: false })),
        });
    }

    agregarAcuerdo(acuerdo: AcuerdoPedidoModel): Promise<ResponseModel> {
        const ots: AcuerdoPedidoModel = {} as AcuerdoPedidoModel;
        ots.prioridadId = acuerdo.prioridadId;
        if (acuerdo.acuerdoId) ots.acuerdoId = acuerdo.acuerdoId;
        ots.acuerdo = acuerdo.acuerdo;
        if (acuerdo.clasificacionSelect) ots.clasificacionId = Number(acuerdo.clasificacionSelect.value);
        if (acuerdo.responsableSelect) ots.responsableId = Number(acuerdo.responsableSelect.value);
        ots.entidadId = (acuerdo.entidadSelect) ? Number(acuerdo.entidadSelect.value) : 0;
        if (acuerdo.tipoSelect) ots.tipoId = Number(acuerdo.tipoSelect.value);
        ots.accesoId = this.authService.getCodigoUsuario();
        // ots.codigoUsuario = this.authService.getCodigoUsuario();
        if (acuerdo.plazo) ots.plazo = acuerdo.plazo;
        ots.pre_Acuerdo = acuerdo.pre_Acuerdo;
        ots.es_preAcuerdo = acuerdo.es_preAcuerdo;

        return new Promise((resolve, reject) => {
            this.http.post<ResponseModel>(`${environment.api}/Acuerdo/RegistrarAcuerdo`, ots).subscribe({
                next: (data) => {
                    this.msg.success(data.message);
                    this.listarAcuerdosPorPedido(acuerdo.prioridadId);
                    resolve(data);
                },
                error: (e) => {
                    this.msg.error(e.message);
                    reject(e);
                },
            });
        });
    }

    eliminarAcuerdo(acuerdo: AcuerdoPedidoModel): Promise<ResponseModel> {
        return new Promise((resolve, reject) => {
            const ots: AcuerdoPedidoModel = {} as AcuerdoPedidoModel;
            this.http.post<ResponseModel>(`${environment.api}/Acuerdo/EliminarAcuerdo`, ots).subscribe({
                next: (data) => {
                    this.msg.success(data.message);
                    this.listarAcuerdosPorPedido(acuerdo.prioridadId);
                    resolve(data);
                },
                error: (e) => {
                    this.msg.error(e.message);
                    reject(e);
                },
            });
        });
    }

    seleccionarAcuerdoById(id: number | null | undefined, es_preAcuerdo: boolean | null = null, isConverting: boolean | null = null): void {
        if (id !== null && id !== undefined) {
            const acuerdo = this.#acuerdosResult().acuerdos?.find((e: AcuerdoPedidoModel) => e.acuerdoId === id) || null;
            this.#acuerdosResult.update((v) => ({ ...v, acuerdoSeleccionado: acuerdo }));
        } else {
            this.#acuerdosResult.update((v) => ({ ...v, acuerdoSeleccionado: null }));

        }

        this.#acuerdosResult.update((v) => ({
            ...v,
            isCreatingPreAcuerdo: (es_preAcuerdo !== null) ? es_preAcuerdo : v.acuerdoSeleccionado?.es_preAcuerdo || null,
            isConverting: (isConverting !== null) ? isConverting : false,
        }));

        // if (es_preAcuerdo !== null) {
        //     this.#acuerdosResult.update((v) => ({ ...v, es_registro_preAcuerdo: es_preAcuerdo }));
        // } else {
        //     this.#acuerdosResult.update((v) => ({ ...v, es_registro_preAcuerdo: null }));
        // }
    }
}
