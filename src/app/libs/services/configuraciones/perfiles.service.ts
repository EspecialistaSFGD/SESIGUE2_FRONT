import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ResponseModel, ResponseModelPaginated } from '../../models/shared/response.model';
import { SelectModel } from '../../models/shared/select.model';
import { PerfilModel } from '../../models/auth/perfil.model';
import { AuthService } from '../auth/auth.service';



interface State {
    perfiles: PerfilModel[];
    perfilSeleccionado: PerfilModel;
    isLoading: boolean;
    isEditing: boolean;
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
    public authService = inject(AuthService);

    #perfilResult = signal<State>({
        perfiles: [],
        perfilSeleccionado: {} as PerfilModel,
        isLoading: true,
        isEditing: false,
        total: 0,
        sortField: null,
        sortOrder: null,
    });

    public perfiles = computed(() => this.#perfilResult().perfiles);
    public perfilSeleccionado = computed(() => this.#perfilResult().perfilSeleccionado);
    public isLoading = computed(() => this.#perfilResult().isLoading);
    public isEditing = computed(() => this.#perfilResult().isEditing);
    public total = computed(() => this.#perfilResult().total);

    constructor() { }

    listarPerfiles(entidadId: number | null = 0, nombrePerfil: string | null = null, pageIndex: number | null = 1, pageSize: number | null = 10, sortField: string | null = 'codigoPerfil', sortOrder: string | null = 'descend'): void {
        // debugger;
        let params = new HttpParams();

        this.#perfilResult.update((state) => ({
            ...state,
            isLoading: true,
        }));

        params = params.append('entidadID', `${entidadId}`);
        params = (nombrePerfil !== null) ? params.append('nombrePerfil', `${nombrePerfil}`) : params;
        params = (pageIndex !== null) ? params.append('piCurrentPage', `${pageIndex}`) : params;
        params = (pageSize !== null) ? params.append('piPageSize', `${pageSize}`) : params;
        params = (sortField !== null) ? params.append('columnSort', `${sortField}`) : params;
        params = (sortOrder !== null) ? params.append('typeSort', `${sortOrder}`) : params;

        this.http.get<ResponseModelPaginated>(`${environment.api}/Perfil/Listar`, { params }).subscribe({
            next: (data) => {
                const res: PerfilModel[] = data.data;

                if (res == null) return;

                res.forEach((p) => {
                    if (p.codigoNivel && p.descripcionNivel) p.nivelSelect = new SelectModel(p.codigoNivel, p.descripcionNivel);
                    if (p.codigoSubTipo && p.descripcionSubTipo) p.subTipoSelect = new SelectModel(p.codigoSubTipo, p.descripcionSubTipo);
                });

                this.#perfilResult.update((v) => ({ ...v, perfiles: res, isLoading: false, total: data.info.total }));
            },
            error: (e) => console.log(e),
            complete: () => this.#perfilResult.update((v) => ({ ...v, isLoading: false })),
        });
    }

    agregarPerfil(perfil: PerfilModel): Promise<ResponseModel> {
        return new Promise((resolve, reject) => {
            this.#perfilResult.update((v) => ({ ...v, isEditing: true }));

            const ots: PerfilModel = {} as PerfilModel;

            if (perfil.codigoPerfil) ots.codigoPerfil = perfil.codigoPerfil;
            if (perfil.descripcionPerfil) ots.descripcionPerfil = perfil.descripcionPerfil;
            if (perfil.nivelSelect) ots.codigoNivel = Number(perfil.nivelSelect.value);
            if (perfil.subTipoSelect) ots.codigoSubTipo = Number(perfil.subTipoSelect.value);
            ots.codigoUsuario = this.authService.getCodigoUsuario();

            this.http.post<ResponseModel>(`${environment.api}/Perfil/RegistrarPerfil`, ots).subscribe({
                next: (data) => {
                    this.msg.success(data.message);
                    this.listarPerfiles();
                    resolve(data);
                },
                error: (e) => {
                    this.msg.error(e.error.message);
                    reject(e);
                },
                complete: () => this.#perfilResult.update((v) => ({ ...v, isEditing: false })),
            });
        });
    }

    eliminarPerfil(perfilId: number): Promise<ResponseModel> {
        return new Promise((resolve, reject) => {
            this.#perfilResult.update((v) => ({ ...v, isEditing: true }));

            const ots: PerfilModel = {} as PerfilModel;
            ots.codigoPerfil = perfilId;
            ots.codigoModifica = this.authService.getCodigoUsuario();

            this.http.post<ResponseModel>(`${environment.api}/Perfil/EliminarPerfil`, ots).subscribe({
                next: (data) => {
                    this.msg.success(data.message);
                    this.listarPerfiles();
                    resolve(data);
                },
                error: (e) => {
                    this.msg.error(e.error.message);
                    reject(e);
                },
                complete: () => this.#perfilResult.update((v) => ({ ...v, isEditing: false })),
            });
        });
    }

    seleccionarPerfilById(perfilId: number | null | undefined): void {
        if (perfilId !== null && perfilId !== undefined) {
            const perfil = this.#perfilResult().perfiles.find((p) => p.codigoPerfil === perfilId);
            this.#perfilResult.update((v) => ({ ...v, perfilSeleccionado: (perfil) ? perfil : {} as PerfilModel }));
        } else {
            this.#perfilResult.update((v) => ({ ...v, perfilSeleccionado: {} as PerfilModel }));
        }
    }
}
