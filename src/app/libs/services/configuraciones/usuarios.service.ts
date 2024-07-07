import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ResponseModelPaginated } from '../../models/shared/response.model';
import { SelectModel } from '../../models/shared/select.model';
import { UsuarioResponseModel } from '../../models/auth/usuario.model';
const fakeApi = 'https://randomuser.me/api/';
interface State {
    usuarios: any[];
    usuarioSeleccionado: any | null | undefined;
    isLoading: boolean;
    total: number;
    sortField: string | null;
    sortOrder: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class UsuariosService {

    public msg = inject(NzMessageService);
    public http = inject(HttpClient);

    #usuariosResult = signal<State>({
        usuarios: [],
        usuarioSeleccionado: null,
        isLoading: true,
        total: 0,
        sortField: null,
        sortOrder: null,
    });

    public usuarios = computed(() => this.#usuariosResult().usuarios);
    public isLoading = computed(() => this.#usuariosResult().isLoading);
    public total = computed(() => this.#usuariosResult().total);

    constructor() { }

    listarUsuarios(nombreUsuario: string | null = null, nombreTrabajador: string | null = null, perfil: SelectModel | null = null, pageIndex: number | null = 1, pageSize: number | null = 10, sortField: string | null = null, sortOrder: string | null = null): void {
        // debugger;
        let params = new HttpParams();

        this.#usuariosResult.update((state) => ({
            ...state,
            isLoading: true,
        }));

        params = (nombreUsuario !== null) ? params.append('nombreUsuario', `${nombreUsuario}`) : params;
        params = (nombreTrabajador !== null) ? params.append('nombreTrabajador', `${nombreTrabajador}`) : params;
        params = (perfil !== null) ? params.append('perfil', `${perfil.value}`) : params;
        params = (pageIndex !== null) ? params.append('piCurrentPage', `${pageIndex}`) : params;
        params = (pageSize !== null) ? params.append('piPageSize', `${pageSize}`) : params;
        params = (sortField !== null) ? params.append('columnSort', `${sortField}`) : params;
        params = (sortOrder !== null) ? params.append('typeSort', `${sortOrder}`) : params;

        this.http.get<ResponseModelPaginated>(`${environment.api}/Usuario/Listar`, { params }).subscribe({
            // this.http.get<ResponseModelPaginated>(`${fakeApi}?results=10`, { params }).subscribe({
            next: (data: any) => {
                // console.log(data);

                // const usuarios: UsuarioResponseModel[] = [];

                // data.results.forEach((usuario: UsuarioResponseModel) => {
                //     let nombre = `${usuario.nombresPersona} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno}`;
                //     usuarios.push(new UsuarioResponseModel(usuario.codigoUsuario, usuario.nombreUsuario, usuario.contrasena, usuario.correoNotificacion, nombre, usuario.tipoDocumento, usuario.numeroDocumento, usuario.codigoPerfil, usuario.descripcionPerfil, usuario.esActivo, usuario.descripcionEstado));
                // });

                // console.log(usuarios);

                this.#usuariosResult.update((v) => ({ ...v, usuarios: data.data, isLoading: false, total: data.info.total }));
            },
            error: (e) => console.log(e),
            complete: () => this.#usuariosResult.update((v) => ({ ...v, isLoading: false })),
        });
    }
}
