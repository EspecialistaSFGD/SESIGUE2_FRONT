import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { SelectModel } from '../../models/shared/select.model';
import { environment } from '../../../../environments/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ResponseModelPaginated } from '../../models/shared/response.model';
import { AcuerdoPedidoModel } from '../../models/pedido';

interface State {
    acuerdos: AcuerdoPedidoModel[] | null;
    acuerdoSeleccionado: AcuerdoPedidoModel | null;
    isLoading: boolean;
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

    #acuerdosResult = signal<State>({
        acuerdos: [],
        acuerdoSeleccionado: null,
        isLoading: true,
        total: 0,
        sortField: null,
        sortOrder: null,
    });

    public acuerdos = computed(() => this.#acuerdosResult().acuerdos);
    public acuerdoSeleccionado = computed(() => this.#acuerdosResult().acuerdoSeleccionado);
    public isLoading = computed(() => this.#acuerdosResult().isLoading);
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
}
