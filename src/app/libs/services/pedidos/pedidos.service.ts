import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { SelectModel } from '../../models/shared/select.model';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';
import { ResponseModel, ResponseModelPaginated } from '../../models/shared/response.model';
import { PedidoModel } from '../../models/pedido';
import { PedidoRequestModel, PedidoResponseModel } from '../../models/pedido/pedido.model';
import { ComentarioModel } from '../../models/pedido/comentario.model';
import { AuthService } from '../auth/auth.service';
import { EstadoEventoType } from '../../shared/types/estado.type';

const accesoId = localStorage.getItem('codigoUsuario') || null;
const perfilId = localStorage.getItem('codigoPerfil') || null;

interface State {
    pedidos: PedidoModel[];
    pedidoSeleccionado: PedidoModel | null;
    estadoEvento: EstadoEventoType | null;
    isLoading: boolean;
    isEditing: boolean;
    total: number;
    sortField: string | null;
    sortOrder: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class PedidosService {

    private msg = inject(NzMessageService);
    private http = inject(HttpClient);
    private authService = inject(AuthService);

    #pedidosResult = signal<State>({
        pedidos: [],
        pedidoSeleccionado: null,
        estadoEvento: null,
        isLoading: true,
        isEditing: false,
        total: 0,
        sortField: null,
        sortOrder: null,
    });

    public pedidos = computed(() => this.#pedidosResult().pedidos);
    public pedidoSeleccionado = computed(() => this.#pedidosResult().pedidoSeleccionado);
    public estadoEvento = computed(() => this.#pedidosResult().pedidoSeleccionado?.estadoEvento);
    public isLoading = computed(() => this.#pedidosResult().isLoading);
    public isEditing = computed(() => this.#pedidosResult().isEditing);
    public total = computed(() => this.#pedidosResult().total);

    constructor() { }
    //TODO: quitar en el caso de que PCM sea el sector a solicitar
    listarPedidos(cui: string | null = null, tipoEspacio: string | null = null, espacio: SelectModel[] | null = null, sector: SelectModel[] | null = null, dep: SelectModel | null = null, prov: SelectModel | null, dis: SelectModel | null = null, pageIndex: number | null = 1, pageSize: number | null = 10, sortField: string | null = 'prioridadID', sortOrder: string | null = 'descend'): void {
        // debugger;
        let params = new HttpParams();

        this.#pedidosResult.update((state) => ({
            ...state,
            isLoading: true,
        }));

        params = (cui !== null) ? params.append('cui', `${cui}`) : params;

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

        if (this.authService.subTipo() == 'SECTOR') {
            params = params.append('validado', 1);
        }

        this.http.get<ResponseModelPaginated>(`${environment.api}/PrioridadAcuerdo/Listar`, { params }).subscribe({
            next: (data) => {
                const result: PedidoResponseModel[] = data.data;
                if (!result) return;

                result.forEach((x: PedidoResponseModel) => {
                    const ubicacion = [
                        x.region ? x.region : '',
                        x.provincia ? x.provincia : '',
                        x.distrito ? x.distrito : ''
                    ].filter(Boolean).join(' / ');

                    if (x.sector && x.sectorid) x.sectorSelect = new SelectModel(x.sectorid, x.sector);
                    if (x.espacio && x.eventoId) x.espacioSelect = new SelectModel(x.eventoId, x.espacio);
                    if (x.tipoInversionId) x.tipoCodigoSelect = x.tipoInversionId.toString();
                    if (x.intervencionesEstrategicas && x.tipoIntervencionId) x.tipoIntervencionSelect = new SelectModel(x.tipoIntervencionId, x.intervencionesEstrategicas);
                    if (x.objetivoEstrategicoTerritorial && x.ejeEstrategicoId) x.ejeEstrategicoSelect = new SelectModel(x.ejeEstrategicoId, x.objetivoEstrategicoTerritorial);
                    if (x.descripcionEstadoEspacio) x.estadoEvento = x.descripcionEstadoEspacio.toUpperCase() as EstadoEventoType;
                    x.ubicacion = ubicacion;
                });

                this.#pedidosResult.update((v) => ({ ...v, pedidos: result, isLoading: false, total: data.info.total }));
            },
            error: (e) => console.log(e),
            complete: () => this.#pedidosResult.update((v) => ({ ...v, isLoading: false })),
        });
    }

    recuperarPedido(id: number): Promise<ResponseModelPaginated> {
        let params = new HttpParams();
        params = params.append('prioridadID', id);
        params = params.append('piCurrentPage', 1);
        params = params.append('piPageSize', 1);
        params = params.append('columnSort', 'prioridadID');
        params = params.append('typeSort', 'descend');
        return new Promise((resolve, reject) => {
            this.http.get<ResponseModelPaginated>(`${environment.api}/PrioridadAcuerdo/Listar`, { params }).subscribe({
                next: (data) => {
                    const result = data.data;
                    if (!result) return;

                    result.forEach((x: PedidoResponseModel) => {
                        if (x.sector && x.sectorid) x.sectorSelect = new SelectModel(x.sectorid, x.sector);
                        if (x.espacio && x.eventoId) x.espacioSelect = new SelectModel(x.eventoId, x.espacio);
                        if (x.intervencionesEstrategicas && x.tipoIntervencionId) x.tipoIntervencionSelect = new SelectModel(x.tipoIntervencionId, x.intervencionesEstrategicas);
                        if (x.objetivoEstrategicoTerritorial && x.ejeEstrategicoId) x.ejeEstrategicoSelect = new SelectModel(x.ejeEstrategicoId, x.objetivoEstrategicoTerritorial);
                        if (x.descripcionEstadoEspacio) x.estadoEvento = x.descripcionEstadoEspacio.toUpperCase() as EstadoEventoType;
                        // if (x.descripcionEstadoEspacio) x.estadoEvento = 'INICIADO' as EstadoEventoType;

                    });

                    this.#pedidosResult.update((v) => ({ ...v, pedidoSeleccionado: result[0], isLoading: false }));
                    resolve(data);
                },
                error: (e) => {
                    reject(e);
                },
            });
        });
    }

    agregarPedido(pedido: PedidoModel): Promise<ResponseModel> {
        // debugger;
        // const codigoPerfil = this.authService.getCodigoPerfil();
        this.#pedidosResult.update((v) => ({ ...v, isEditing: true }));

        // if (codigoPerfil === 0)
        //     return new Promise((resolve, reject) => {
        //         this.#pedidosResult.update((v) => ({ ...v, isEditing: false }));
        //         this.msg.error('No se pudo obtener el Cógido de Perfil...')

        //         reject(new Error('No se pudo obtener el Código de Perfil'));
        //     });

        return new Promise((resolve, reject) => {

            const ots: PedidoRequestModel = {} as PedidoRequestModel;

            if (pedido.prioridadID) ots.prioridadId = pedido.prioridadID;
            if (pedido.espacioSelect) ots.eventoId = Number(pedido.espacioSelect.value);
            if (pedido.sectorSelect) ots.grupoId = Number(pedido.sectorSelect.value);
            ots.aspectoCriticoResolver = pedido.aspectoCriticoResolver;
            if (pedido.cuis) ots.cuis = pedido.cuis;

            if (pedido.tipoCodigoSelect) {
                ots.tipoInversionId = Number(pedido.tipoCodigoSelect);
            }

            if (pedido.tipoIntervencionSelect) {
                ots.tipoIntervencionId = Number(pedido.tipoIntervencionSelect.value);
                ots.intervencionesEstrategicas = pedido.tipoIntervencionSelect.label;
            }

            if (pedido.ejeEstrategicoSelect) {
                ots.ejeEstrategicoId = Number(pedido.ejeEstrategicoSelect.value);
                ots.objetivoEstrategicoTerritorial = pedido.ejeEstrategicoSelect.label;
            }

            ots.accesoId = Number(accesoId);
            ots.codigoPerfil = Number(perfilId);

            if (pedido.sectorSelect) ots.grupoId = Number(pedido.sectorSelect.value);

            if (pedido.distritoSelect) {
                ots.ubigeo = pedido.distritoSelect.value?.toString();
            } else if (pedido.provinciaSelect) {
                ots.ubigeo = pedido.provinciaSelect.value?.toString();
            } else if (pedido.departamentoSelect) {
                ots.ubigeo = pedido.departamentoSelect.value?.toString();
            }

            this.http.post<ResponseModel>(`${environment.api}/PrioridadAcuerdo/RegistrarPrioridadAcuerdo`, ots).subscribe({
                next: (data) => {
                    this.msg.success(data.message);
                    // this.listarPedidos();
                    resolve(data);
                },
                error: (e) => {
                    reject(e);
                },
                complete: () => this.#pedidosResult.update((v) => ({ ...v, isEditing: false })),
            });
        });
    }

    eliminarPedido(id: number): Promise<ResponseModel> {
        return new Promise((resolve, reject) => {
            this.#pedidosResult.update((v) => ({ ...v, isLoading: true }));

            this.http.post<ResponseModel>(`${environment.api}/PrioridadAcuerdo/EliminarPrioridadAcuerdo`, { prioridadId: id, accesoIdMod: Number(accesoId) }).subscribe({
                next: (data) => {
                    this.#pedidosResult.update((v) => ({ ...v, isLoading: false }));
                    resolve(data);
                },
                error: (e) => {
                    reject(e);
                },
            });
        });

    }

    validarPedido(pedido: PedidoModel): Promise<ResponseModel> {
        return new Promise((resolve, reject) => {
            this.#pedidosResult.update((v) => ({ ...v, isEditing: true }));

            const ots: PedidoRequestModel = {} as PedidoRequestModel;

            ots.prioridadId = pedido.prioridadID;
            ots.accesoId = Number(accesoId);

            this.http.post<ResponseModel>(`${environment.api}/PrioridadAcuerdo/ValidarPrioridadAcuerdo`, ots).subscribe({
                next: (data) => {
                    this.msg.success(data.message);
                    // this.listarPedidos();
                    resolve(data);
                },
                error: (e) => {
                    reject(e);
                },
                complete: () => {
                    this.#pedidosResult.update((v) => ({ ...v, isEditing: false }));
                }
            });
        });
    }

    comentarPcmPedido(comentario: ComentarioModel): Promise<ResponseModel> {
        if (comentario.id == null) {
            this.msg.error('No se ha seleccionado un pedido para agregar comentario SD');
            return new Promise((resolve, reject) => reject('No se ha seleccionado un pedido para agregar comentario SD'));
        }

        this.#pedidosResult.update((v) => ({ ...v, isEditing: true }));

        const ots: PedidoRequestModel = {} as PedidoRequestModel;
        ots.prioridadId = comentario.id;
        ots.comentarioPcm = comentario.comentario;
        ots.accesoId = Number(accesoId);

        return new Promise((resolve, reject) => {
            this.http.post<ResponseModel>(`${environment.api}/PrioridadAcuerdo/ComentarPCMPrioridadAcuerdo`, ots).subscribe({
                next: (data) => {
                    this.msg.success(data.message);
                    //TODO: solucionar en el llamado
                    // this.listarPedidos();
                    resolve(data);
                },
                error: (e) => {
                    reject(e);
                },
                complete: () => this.#pedidosResult.update((v) => ({ ...v, isEditing: false })),
            });
        });
    }

    seleccionarPedidoById(id: number | null | undefined): void {
        if (id !== null && id !== undefined) {
            const pedido = this.#pedidosResult().pedidos?.find((e: PedidoModel) => e.prioridadID === id) || null;
            this.#pedidosResult.update((v) => ({ ...v, pedidoSeleccionado: pedido }));
        } else {
            this.#pedidosResult.update((v) => ({ ...v, pedidoSeleccionado: null }));
        }
    }

}
