import { computed, inject, Injectable, signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BaseHttpService } from '../../shared/base-http.service';
import { AuthService } from '../auth/auth.service';
import { HttpParams } from '@angular/common/http';
import { ResponseModel, ResponseModelPaginated } from '../../models/shared/response.model';
import { PerfilBotonModel } from '../../models/auth/perfil.model';

interface State {
    botones: PerfilBotonModel[];
    botonSeleccionado: PerfilBotonModel;
    isLoading: boolean;
    isEditing: boolean;
    total: number;
    sortField: string | null;
    sortOrder: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class BotonesService extends BaseHttpService {

    public authService = inject(AuthService);

    #botonResult = signal<State>({
        botones: [],
        botonSeleccionado: {} as PerfilBotonModel,
        isLoading: true,
        isEditing: false,
        total: 0,
        sortField: null,
        sortOrder: null,
    });

    public botones = computed(() => this.#botonResult().botones);
    public botonSeleccionado = computed(() => this.#botonResult().botonSeleccionado);
    public isLoading = computed(() => this.#botonResult().isLoading);
    public isEditing = computed(() => this.#botonResult().isEditing);
    public total = computed(() => this.#botonResult().total);

    listarBotones(codigoBoton: number | null = null, pageIndex: number | null = 1, pageSize: number | null = 10, sortField: string | null = 'codigoBoton', sortOrder: string | null = 'descend'): void {
        let params = new HttpParams();

        this.#botonResult.update((state) => ({
            ...state,
            isLoading: true,
        }));

        if (codigoBoton) params = params.append('codigoBoton', `${codigoBoton}`);

        params = params.append('piCurrentPage', `${pageIndex}`);
        params = params.append('piPageSize', `${pageSize}`);
        params = params.append('columnSort', `${sortField}`);
        params = params.append('typeSort', `${sortOrder}`);

        this.http.get<ResponseModelPaginated>(`${this.apiUrl}/Boton/Listar`, { params }).subscribe({
            next: (data) => {
                this.#botonResult.update((state) => ({
                    ...state,
                    botones: data.data,
                    total: data.info.total,
                    isLoading: false,
                }));
            },
            error: (error) => {
                this.#botonResult.update((state) => ({
                    ...state,
                    isLoading: false,
                }));
                this.msg.error(error);
            },
        });
    }

    agregarBoton(boton: PerfilBotonModel): Promise<ResponseModel> {
        return new Promise((resolve, reject) => {
            this.#botonResult.update((state) => ({ ...state, isEditing: true }));

            const ots: PerfilBotonModel = {} as PerfilBotonModel;

            if (boton.codigoBoton) ots.codigoBoton = boton.codigoBoton;
            if (boton.descripcionBoton) ots.descripcionBoton = boton.descripcionBoton;
            if (boton.iconoBoton) ots.iconoBoton = boton.iconoBoton;
            if (boton.ordenBoton) ots.ordenBoton = Number(boton.ordenBoton);
            ots.codigoUsuario = this.authService.getCodigoUsuario();
            ots.codigoModifica = this.authService.getCodigoUsuario();

            this.http.post<ResponseModel>(`${this.apiUrl}/Boton/RegistrarBoton`, ots).subscribe({
                next: (data) => {
                    this.msg.success(data.message);
                    this.listarBotones();
                    resolve(data);
                },
                error: (error) => {
                    this.msg.error(error);
                    reject(error);
                },
                complete: () => {
                    this.#botonResult.update((state) => ({ ...state, isEditing: false }));
                }
            });
        });
    }

    eliminarBoton(codigoBoton: number): Promise<ResponseModel> {
        return new Promise((resolve, reject) => {
            this.#botonResult.update((state) => ({ ...state, isLoading: true }));

            const ots: PerfilBotonModel = {} as PerfilBotonModel;

            ots.codigoBoton = codigoBoton;
            ots.codigoUsuario = this.authService.getCodigoUsuario();

            this.http.post<ResponseModel>(`${this.apiUrl}/Boton/EliminarBoton}`, ots).subscribe({
                next: (data) => {
                    this.msg.success(data.message);
                    this.listarBotones();
                    resolve(data);
                },
                error: (error) => {
                    this.msg.error(error);
                    reject(error);
                },
                complete: () => {
                    this.#botonResult.update((state) => ({ ...state, isLoading: false }));
                }
            });
        });
    }

    seleccionarBotonById(codigoBoton: number | null | undefined): void {
        if (codigoBoton !== null && codigoBoton !== undefined) {
            const boton = this.#botonResult().botones.find((m) => m.codigoBoton === codigoBoton);
            this.#botonResult.update((state) => ({ ...state, botonSeleccionado: (boton) ? boton : {} as PerfilBotonModel }));
        } else {
            this.#botonResult.update((state) => ({ ...state, botonSeleccionado: {} as PerfilBotonModel }));
        }
    }
}
