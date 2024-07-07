import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ResponseModelPaginated } from '../../models/shared/response.model';
import { SelectModel } from '../../models/shared/select.model';

interface State {
    perfiles: any[];
    perfilSeleccionado: any | null | undefined;
    isLoading: boolean;
    total: number;
    sortField: string | null;
    sortOrder: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class PerfilesService {

    public msg = inject(NzMessageService);
    public http = inject(HttpClient);

    #perfilResult = signal<State>({
        perfiles: [],
        perfilSeleccionado: null,
        isLoading: true,
        total: 0,
        sortField: null,
        sortOrder: null,
    });

    public perfiles = computed(() => this.#perfilResult().perfiles);
    public isLoading = computed(() => this.#perfilResult().isLoading);
    public total = computed(() => this.#perfilResult().total);

    constructor() { }

    listarPerfiles(nombrePerfil: string | null = null, pageIndex: number | null = 1, pageSize: number | null = 10, sortField: string | null = null, sortOrder: string | null = null): void {
        // debugger;
        let params = new HttpParams();

        this.#perfilResult.update((state) => ({
            ...state,
            isLoading: true,
        }));

        params = (nombrePerfil !== null) ? params.append('nombrePerfil', `${nombrePerfil}`) : params;
        params = (pageIndex !== null) ? params.append('piCurrentPage', `${pageIndex}`) : params;
        params = (pageSize !== null) ? params.append('piPageSize', `${pageSize}`) : params;
        params = (sortField !== null) ? params.append('columnSort', `${sortField}`) : params;
        params = (sortOrder !== null) ? params.append('typeSort', `${sortOrder}`) : params;

        this.http.get<ResponseModelPaginated>(`${environment.api}/Perfil/Listar`, { params }).subscribe({
            next: (data) => {
                // console.log(data);

                this.#perfilResult.update((v) => ({ ...v, perfiles: data.data, isLoading: false, total: data.info.total }));
            },
            error: (e) => console.log(e),
            complete: () => this.#perfilResult.update((v) => ({ ...v, isLoading: false })),
        });
    }
}
