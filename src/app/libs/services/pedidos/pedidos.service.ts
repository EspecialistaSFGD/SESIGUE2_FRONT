import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { SelectModel } from '../../models/shared/select.model';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';
import { ResponseModelPaginated } from '../../models/shared/response.model';

interface State {
    pedidos: any[];
    pedidoSeleccionado: any | null | undefined;
    isLoading: boolean;
    pageIndex: number;
    pageSize: number;
    total: number;
    sortField: string | null;
    sortOrder: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class PedidosService {

    public msg = inject(NzMessageService);
    public http = inject(HttpClient);
    private router = inject(Router);

    #pedidosResult = signal<State>({
        pedidos: [],
        pedidoSeleccionado: null,
        isLoading: true,
        pageIndex: 1,
        pageSize: 10,
        total: 0,
        sortField: null,
        sortOrder: null,
    });

    public pedidos = computed(() => this.#pedidosResult().pedidos);
    public isLoading = computed(() => this.#pedidosResult().isLoading);
    public pageIndex = computed(() => this.#pedidosResult().pageIndex);
    public pageSize = computed(() => this.#pedidosResult().pageSize);
    public total = computed(() => this.#pedidosResult().total);

    constructor() { }

    listarPedidos(espacio: SelectModel[] | null = null, sector: SelectModel[] | null = null, dep: SelectModel | null = null, prov: SelectModel | null = null, pageIndex: number | null = 1, pageSize: number | null = 10, sortField: string | null = null, sortOrder: string | null = null): void {
        let params = new HttpParams();

        this.#pedidosResult.update((state) => ({
            ...state,
            isLoading: true,
        }));


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

        params = (pageIndex !== null) ? params.append('piCurrentPage', `${pageIndex}`) : params;
        params = (pageSize !== null) ? params.append('piPageSize', `${pageSize}`) : params;
        params = (sortField !== null) ? params.append('columnSort', `${sortField}`) : params;
        params = (sortOrder !== null) ? params.append('typeSort', `${sortOrder}`) : params;

        this.http.get<any>(`${environment.api}/PrioridadAcuerdo/Listar`, { params }).subscribe({
            next: (data) => {
                this.#pedidosResult.update((v) => ({ ...v, pedidos: data.data, isLoading: false, total: data.info.total }));
            },
            error: (e) => console.log(e),
            complete: () => this.#pedidosResult.update((v) => ({ ...v, isLoading: false })),
        });
    }
}
