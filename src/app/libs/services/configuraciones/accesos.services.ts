import { computed, inject, Injectable, signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BaseHttpService } from '../../shared/base-http.service';
import { AuthService } from '../auth/auth.service';
import { HttpParams } from '@angular/common/http';
import { ResponseModel, ResponseModelPaginated } from '../../models/shared/response.model';
import { PerfilAccesoModel } from '../../models/auth/perfil.model';

interface State {
    accesos: PerfilAccesoModel[];
    accesoSeleccionado: PerfilAccesoModel;
    isLoading: boolean;
    isEditing: boolean;
    total: number;
    sortField: string | null;
    sortOrder: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class AccesosService extends BaseHttpService {

    public authService = inject(AuthService);

    #accesoResult = signal<State>({
        accesos: [],
        accesoSeleccionado: {} as PerfilAccesoModel,
        isLoading: true,
        isEditing: false,
        total: 0,
        sortField: null,
        sortOrder: null,
    });

    public accesos = computed(() => this.#accesoResult().accesos);
    public accesoSeleccionado = computed(() => this.#accesoResult().accesoSeleccionado);
    public isLoading = computed(() => this.#accesoResult().isLoading);
    public isEditing = computed(() => this.#accesoResult().isEditing);
    public total = computed(() => this.#accesoResult().total);

    listarAccesos(codigoPerfil: number | null = null, pageIndex: number | null = 1, pageSize: number | null = 10, sortField: string | null = 'codigoPerfil', sortOrder: string | null = 'descend'): void {
        let params = new HttpParams();

        this.#accesoResult.update((state) => ({
            ...state,
            isLoading: true,
        }));

        if (codigoPerfil) params = params.append('codigoPerfil', `${codigoPerfil}`);

        params = params.append('piCurrentPage', `${pageIndex}`);
        params = params.append('piPageSize', `${pageSize}`);
        params = params.append('columnSort', `${sortField}`);
        params = params.append('typeSort', `${sortOrder}`);

        this.http.get<ResponseModelPaginated>(`${this.apiUrl}/Acceso/Listar`, { params }).subscribe({
            next: (data) => {
                this.#accesoResult.update((state) => ({
                    ...state,
                    accesos: data.data,
                    total: data.info.total,
                    isLoading: false,
                }));
            },
            error: (error) => {
                this.#accesoResult.update((state) => ({
                    ...state,
                    isLoading: false,
                }));
                this.msg.error(error);
            },
        });
    }

    agregarAcceso(boton: PerfilAccesoModel): Promise<ResponseModel> {
        return new Promise((resolve, reject) => {
            this.#accesoResult.update((state) => ({ ...state, isEditing: true }));

            const ots: PerfilAccesoModel = {} as PerfilAccesoModel;

            if (boton.codigoAcceso) ots.codigoAcceso = boton.codigoAcceso;
            if (boton.codigoPerfil) ots.codigoPerfil = boton.codigoPerfil;
            if (boton.codigoMenu) ots.codigoMenu = Number(boton.codigoMenu);
            ots.codigoUsuario = this.authService.getCodigoUsuario();
            ots.codigoModifica = this.authService.getCodigoUsuario();

            this.http.post<ResponseModel>(`${this.apiUrl}/Acceso/RegistrarAcceso`, ots).subscribe({
                next: (data) => {
                    this.msg.success(data.message);
                    this.listarAccesos();
                    resolve(data);
                },
                error: (error) => {
                    this.msg.error(error);
                    reject(error);
                },
                complete: () => {
                    this.#accesoResult.update((state) => ({ ...state, isEditing: false }));
                }
            });
        });
    }

    eliminarAcceso(codigoPerfil: number): Promise<ResponseModel> {
        return new Promise((resolve, reject) => {
            this.#accesoResult.update((state) => ({ ...state, isLoading: true }));

            const ots: PerfilAccesoModel = {} as PerfilAccesoModel;

            ots.codigoAcceso = codigoPerfil;
            ots.codigoModifica = this.authService.getCodigoUsuario();

            this.http.post<ResponseModel>(`${this.apiUrl}/Acceso/EliminarAcceso}`, ots).subscribe({
                next: (data) => {
                    this.msg.success(data.message);
                    this.listarAccesos();
                    resolve(data);
                },
                error: (error) => {
                    this.msg.error(error);
                    reject(error);
                },
                complete: () => {
                    this.#accesoResult.update((state) => ({ ...state, isLoading: false }));
                }
            });
        });
    }

    seleccionarAccesoById(codigoAcceso: number | null | undefined): void {
        if (codigoAcceso !== null && codigoAcceso !== undefined) {
            const boton = this.#accesoResult().accesos.find((m) => m.codigoAcceso === codigoAcceso);
            this.#accesoResult.update((state) => ({ ...state, accesoSeleccionado: (boton) ? boton : {} as PerfilAccesoModel }));
        } else {
            this.#accesoResult.update((state) => ({ ...state, accesoSeleccionado: {} as PerfilAccesoModel }));
        }
    }
}
