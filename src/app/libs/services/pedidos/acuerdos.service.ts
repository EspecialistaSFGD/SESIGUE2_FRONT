import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { SelectModel } from '../../models/shared/select.model';
import { environment } from '../../../../environments/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ResponseModel, ResponseModelPaginated } from '../../models/shared/response.model';
import { AcuerdoPedidoModel } from '../../models/pedido';
import { UtilesService } from '../../shared/services/utiles.service';
import { AuthService } from '../auth/auth.service';
import { AcuerdoPedidoExpressModel, DesestimacionModel } from '../../models/pedido/acuerdo.model';
import { EstadoEventoType } from '../../shared/types/estado.type';
import { AcuerdoDesestimacionResponse, AcuerdoDesestimacionResponses } from '@core/interfaces';
import { catchError, map, of, tap } from 'rxjs';
import { HelpersService } from '@core/services';

interface State {
    acuerdos: AcuerdoPedidoModel[];
    acuerdoSeleccionado: AcuerdoPedidoModel | null;
    estadoEvento: EstadoEventoType | null;
    isLoading: boolean;
    isEditing: boolean;
    isCreatingPreAcuerdo: boolean | null;
    isConverting: boolean | null;
    isDesestimated: boolean | null;
    total: number;
    sortField: string | null;
    sortOrder: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class AcuerdosService {

    private urlAcuerdo: string = `${environment.api}/Acuerdo`

    private msg = inject(NzMessageService);
    private http = inject(HttpClient);
    private utilesService = inject(UtilesService);
    private authService = inject(AuthService);
    private helpersServices = inject(HelpersService);

    #acuerdosResult = signal<State>({
        acuerdos: [],
        acuerdoSeleccionado: null,
        estadoEvento: null,
        isLoading: true,
        isEditing: false,
        isCreatingPreAcuerdo: false,
        isConverting: false,
        isDesestimated: false,
        total: 0,
        sortField: null,
        sortOrder: null,
    });

    public acuerdos = computed(() => this.#acuerdosResult().acuerdos);
    public acuerdoSeleccionado = computed(() => this.#acuerdosResult().acuerdoSeleccionado);
    public estadoEvento = computed(() => this.#acuerdosResult().acuerdoSeleccionado?.estadoEvento);
    public isCreatingPreAcuerdo = computed(() => this.#acuerdosResult().isCreatingPreAcuerdo);
    public isConverting = computed(() => this.#acuerdosResult().isConverting);
    public isDesestimated = computed(() => this.acuerdoSeleccionado()?.nomEstadoRegistro === 'DESESTIMADO' || this.acuerdoSeleccionado()?.nomEstadoRegistro === 'CULMINADO');
    public isDesestimating = computed(() => this.acuerdoSeleccionado()?.fechaPedidoDesestimacion != null);
    public isLoading = computed(() => this.#acuerdosResult().isLoading);
    public isEditing = computed(() => this.#acuerdosResult().isEditing);
    public total = computed(() => this.#acuerdosResult().total);
    // helpersServices: any;

    constructor() { }

    aprobarDesestimacion(desestimacion: AcuerdoDesestimacionResponse ) {
        const headers = this.helpersServices.getAutorizationToken()
        return this.http.put<AcuerdoDesestimacionResponses>(`${this.urlAcuerdo}/AprobarDesestimacion/${desestimacion.acuerdoId}`, desestimacion, { headers })
        .pipe(
            tap(resp => {
            return resp
            }),
            map(valid => valid.success),
            catchError(err => of(err))
        )
    }

    listarAcuerdos(cui: string | null = null, clasificacion: SelectModel[] | null = null, tipo: SelectModel | null = null, estadoAcuerdo: SelectModel[] | null = null, tipoEspacio: string | null = null, espacio: SelectModel[] | null = null, sector: SelectModel[] | null = null, dep: SelectModel | null = null, prov: SelectModel | null = null, dis: SelectModel | null = null, pageIndex: number | null = 1, pageSize: number | null = 10, sortField: string | null = null, sortOrder: string | null = null): void {
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

        if (dis !== null) {
            params = params.append('ubigeo', `${dis.value}`);
        } else if (prov !== null) {
            params = params.append('ubigeo', `${prov.value}`);
        } else if (dep !== null) {
            params = params.append('ubigeo', `${dep.value}`);
        }
        params = tipoEspacio ? params.append('tipoEspacio', tipoEspacio) : params;
        params = (pageIndex !== null) ? params.append('piCurrentPage', `${pageIndex}`) : params;
        params = (pageSize !== null) ? params.append('piPageSize', `${pageSize}`) : params;
        params = (sortField !== null) ? params.append('columnSort', `${sortField}`) : params;
        params = (sortOrder !== null) ? params.append('typeSort', `${sortOrder}`) : params;



        this.http.get<ResponseModelPaginated>(`${environment.api}/Acuerdo/Listar`, { params }).subscribe({
            next: (data) => {
                const result: AcuerdoPedidoModel[] = data.data;
                if (!result) return;

                result.forEach((x: AcuerdoPedidoModel) => {
                    const ubicacion = [
                        x.region ? x.region : '',
                        x.provincia ? x.provincia : '',
                        x.distrito ? x.distrito : ''
                    ].filter(Boolean).join(' / ');

                    x.ubicacion = ubicacion;
                });

                this.#acuerdosResult.update((v) => ({ ...v, acuerdos: result, isLoading: false, total: data.info.total }));
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
        // params = params.append('estadoId[]', 1);

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
                    if (acuerdo.tipo && acuerdo.tipoId) acuerdo.tipoSelect = acuerdo.tipoId.toString();
                    // if (acuerdo.plazo) acuerdo.plazo = this.utilesService.stringToDate(acuerdo.plazo.toString());
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
                        if (acuerdo.descripcionEstadoEspacio) acuerdo.estadoEvento = acuerdo.descripcionEstadoEspacio.toUpperCase() as EstadoEventoType;

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

        if (acuerdo.clasificacionSelect) ots.clasificacionId = Number(acuerdo.clasificacionSelect.value);
        if (acuerdo.responsableSelect) ots.responsableId = Number(acuerdo.responsableSelect.value);
        ots.entidadId = (acuerdo.entidadSelect) ? Number(acuerdo.entidadSelect.value) : 0;
        if (acuerdo.tipoSelect) ots.tipoId = Number(acuerdo.tipoSelect);
        ots.accesoId = this.authService.getCodigoUsuario();
        if (acuerdo.plazo) ots.plazo = acuerdo.plazo;
        if (acuerdo.es_preAcuerdoBool !== null) {
            ots.es_preAcuerdo = (acuerdo.es_preAcuerdoBool) ? 0 : 1;
            //TODO: verificar si va de esta manera
            if (acuerdo.es_preAcuerdoBool) {
                if (acuerdo.pre_acuerdo) ots.pre_acuerdo = acuerdo.pre_acuerdo;
            } else {
                if (acuerdo.pre_acuerdo) ots.pre_acuerdo = acuerdo.pre_acuerdo;
                if (acuerdo.acuerdo) ots.acuerdo = acuerdo.acuerdo;
                if (acuerdo.eventoId) ots.eventoId = acuerdo.eventoId;
            }
        }

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

    agregarAcuerdoExpress(acuerdo: AcuerdoPedidoExpressModel): Promise<ResponseModel> {
        const ots: AcuerdoPedidoExpressModel = {} as AcuerdoPedidoExpressModel;    

        if (acuerdo.espacioSelect) ots.eventoId = Number(acuerdo.eventoId); //Number(acuerdo.espacioSelect.value);
        if (acuerdo.sectorSelect) ots.grupoId = Number(acuerdo.sectorSelect.value);
        // if (acuerdo.provinciaSelect) ots.ubigeo = acuerdo.provinciaSelect.value?.toString();

        if (acuerdo.distritoSelect) {
            ots.ubigeo = acuerdo.distritoSelect.value?.toString();
        } else if (acuerdo.provinciaSelect) {
            ots.ubigeo = acuerdo.provinciaSelect.value?.toString();
        } else if (acuerdo.departamentoSelect) {
            ots.ubigeo = acuerdo.departamentoSelect.value?.toString();
        }

        if (acuerdo.aspectoCriticoResolver) ots.aspectoCriticoResolver = acuerdo.aspectoCriticoResolver;
        if (acuerdo.tipoCodigoSelect) ots.tipoCodigo = Number(acuerdo.tipoCodigoSelect.value);
        if (acuerdo.cuis) ots.cuis = acuerdo.cuis;

        if (acuerdo.ejeEstrategicoSelect) {
            ots.ejeEstrategicoId = Number(acuerdo.ejeEstrategicoSelect.value);
            ots.objetivoEstrategicoTerritorial = acuerdo.ejeEstrategicoSelect.label;
        }

        if (acuerdo.tipoIntervencionSelect) {
            ots.tipoIntervencionId = Number(acuerdo.tipoIntervencionSelect.value);
            ots.intervencionesEstrategicas = acuerdo.tipoIntervencionSelect.label;
        }

        if (acuerdo.tipoSelect) ots.tipoId = Number(acuerdo.tipoSelect);
        ots.acuerdo = acuerdo.acuerdo;
        if (acuerdo.clasificacionSelect) ots.clasificacionId = Number(acuerdo.clasificacionSelect.value);
        if (acuerdo.plazo) ots.plazo = acuerdo.plazo;
        if (acuerdo.responsableSelect) ots.responsableId = Number(acuerdo.responsableSelect.value);
        ots.accesoId = this.authService.getCodigoUsuario();
        ots.entidadId = (acuerdo.entidadSelect) ? Number(acuerdo.entidadSelect.value) : 0;
        ots.es_preAcuerdo = Number(acuerdo.pre_acuerdo);

        return new Promise((resolve, reject) => {
            this.http.post<ResponseModel>(`${environment.api}/Acuerdo/RegistrarAcuerdoExpress`, ots).subscribe({
                next: (data) => {
                    this.msg.success(data.message);
                    // this.listarAcuerdos();
                    resolve(data);
                },
                error: (e) => {
                    this.msg.error(e.message);
                    reject(e);
                },
            });
        });
    }

    convertirAcuerdo(acuerdo: AcuerdoPedidoModel): Promise<ResponseModel> {
        if (acuerdo.acuerdoModificado === null || acuerdo.acuerdoModificado === undefined) {
            return new Promise((resolve, reject) => {
                this.msg.error('No se ha ingresado un acuerdo para convertir');
                reject('No se ha ingresado un acuerdo para convertir');
            });
        }

        const ots: AcuerdoPedidoModel = {} as AcuerdoPedidoModel;
        ots.prioridadId = acuerdo.prioridadId;
        if (acuerdo.acuerdoId) ots.acuerdoId = acuerdo.acuerdoId;

        if (acuerdo.clasificacionSelect) ots.clasificacionId = Number(acuerdo.clasificacionSelect.value);
        if (acuerdo.responsableSelect) ots.responsableId = Number(acuerdo.responsableSelect.value);
        ots.entidadId = (acuerdo.entidadSelect) ? Number(acuerdo.entidadSelect.value) : 0;
        if (acuerdo.tipoSelect) ots.tipoId = Number(acuerdo.tipoSelect);
        ots.accesoId = this.authService.getCodigoUsuario();
        if (acuerdo.plazo) ots.plazo = acuerdo.plazo;

        if (acuerdo.es_preAcuerdoBool !== null) {
            ots.es_preAcuerdo = (acuerdo.es_preAcuerdoBool) ? 1 : 0;
        }

        if (acuerdo.acuerdo) ots.acuerdo = acuerdo.acuerdo;
        if (acuerdo.pre_acuerdo) ots.pre_acuerdo = acuerdo.pre_acuerdo;
        if (acuerdo.eventoId) ots.eventoId = acuerdo.eventoId;     

        return new Promise((resolve, reject) => {
            this.http.post<ResponseModel>(`${environment.api}/Acuerdo/ConvertirPreAcuerdo`, ots).subscribe({
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
        if (acuerdo.acuerdoId === null || acuerdo.acuerdoId === undefined) {
            return new Promise((resolve, reject) => {
                this.msg.error('No se ha seleccionado un acuerdo para eliminar');
                reject('No se ha seleccionado un acuerdo para eliminar');
            });
        }

        const ots: AcuerdoPedidoModel = {} as AcuerdoPedidoModel;
        ots.acuerdoId = acuerdo.acuerdoId;
        ots.accesoId = this.authService.getCodigoUsuario();

        return new Promise((resolve, reject) => {

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

    descargarEvidenciaDesestimacion(acuerdoId: number): Promise<ResponseModel> {
        return new Promise((resolve, reject) => {
            this.http.get(`${environment.api}/Acuerdo/Descargar?acuerdoId=${acuerdoId}`).subscribe({
                next: (data: ResponseModel) => {
                    resolve(data);
                },
                error: (e) => {
                    reject(e);
                },
            });
        });
    }

    solicitarDesestimacionAcuerdo(desestimacion: DesestimacionModel): Promise<ResponseModel> {
        return new Promise((resolve, reject) => {
            this.#acuerdosResult.update((state) => ({
                ...state,
                isEditing: true,
            }));

            let formData: FormData = new FormData();

            // if (desestimacion.acuerdoId != null) formData.append('acuerdoId', `${desestimacion.acuerdoId}`);

            if (desestimacion.motivoDesestimacion != null) formData.append('motivoDesestimacion', desestimacion.motivoDesestimacion);

            // Asegúrate de que evidencia no sea undefined
            if (desestimacion.evidencia !== null && desestimacion.evidencia !== undefined) {
                formData.append('evidencia', desestimacion.evidencia, desestimacion.evidencia.name);
            }

            formData.append('accesoId', this.authService.getCodigoUsuario().toString());

            this.http.put(`${environment.api}/Acuerdo/DesestimarAcuerdo/${desestimacion.acuerdoId}`, formData).subscribe({
                next: (data: ResponseModel) => {
                    this.msg.success(data.message);
                    resolve(data);
                },
                error: (e) => {
                    this.msg.error(`Error al agregar hito: ${e}`);
                    reject(e);
                },
                complete: () => this.#acuerdosResult.update((v) => ({ ...v, isEditing: false })),
            });
        });
    }

    seleccionarAcuerdoById(id: number | null | undefined): void {
        if (id !== null && id !== undefined) {
            const acuerdo = this.#acuerdosResult().acuerdos?.find((e: AcuerdoPedidoModel) => e.acuerdoId === id) || null;
            this.#acuerdosResult.update((v) => ({ ...v, acuerdoSeleccionado: acuerdo }));
        } else {
            this.#acuerdosResult.update((v) => ({ ...v, acuerdoSeleccionado: null }));

        }

        // this.#acuerdosResult.update((v) => ({
        //     ...v,
        //     isCreatingPreAcuerdo: (es_preAcuerdoBool !== null) ? es_preAcuerdoBool : v.acuerdoSeleccionado?.es_preAcuerdoBool || null,
        //     isConverting: (isConverting !== null) ? isConverting : false,
        // }));
    }
}
