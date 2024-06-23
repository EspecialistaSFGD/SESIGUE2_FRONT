import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ResponseModelPaginated } from '../../models/shared/response.model';

interface State {
    avances: any[];
    avanceSeleccionado: any | null | undefined;
    isLoading: boolean;
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

    #avancesResult = signal<State>({
        avances: [],
        avanceSeleccionado: null,
        isLoading: true,
        total: 0,
        sortField: null,
        sortOrder: null,
    });

    public avances = computed(() => this.#avancesResult().avances);
    public isLoading = computed(() => this.#avancesResult().isLoading);
    public total = computed(() => this.#avancesResult().total);

    constructor() { }

    listarAvances(hitoID: number | null = null, pageIndex: number | null = 1, pageSize: number | null = 10, sortField: string | null = null, sortOrder: string | null = null): void {
        // debugger;
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
                console.log(data);

                this.#avancesResult.update((v) => ({ ...v, avances: data.data, isLoading: false, total: data.info.total }));
            },
            error: (e) => console.log(e),
            complete: () => this.#avancesResult.update((v) => ({ ...v, isLoading: false })),
        });
    }
}
