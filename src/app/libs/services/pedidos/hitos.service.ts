import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { SelectModel } from '../../models/shared/select.model';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';
import { ResponseModelPaginated } from '../../models/shared/response.model';

interface State {
    hitos: any[];
    hitoSeleccionado: any | null | undefined;
    isLoading: boolean;
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

    #hitosResult = signal<State>({
        hitos: [],
        hitoSeleccionado: null,
        isLoading: true,
        total: 0,
        sortField: null,
        sortOrder: null,
    });

    public hitos = computed(() => this.#hitosResult().hitos);
    public isLoading = computed(() => this.#hitosResult().isLoading);
    public total = computed(() => this.#hitosResult().total);

    constructor() { }

    listarHitos(acuerdoID: number | null = null, pageIndex: number | null = 1, pageSize: number | null = 10, sortField: string | null = null, sortOrder: string | null = null): void {
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
                // console.log(data);

                this.#hitosResult.update((v) => ({ ...v, hitos: data.data, isLoading: false, total: data.info.total }));
            },
            error: (e) => console.log(e),
            complete: () => this.#hitosResult.update((v) => ({ ...v, isLoading: false })),
        });
    }
}
