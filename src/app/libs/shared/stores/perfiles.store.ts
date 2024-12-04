import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
// import { environment } from '../../../../environments/environment.development';
import { ResponseModel } from '../../models/shared/response.model';
import { SelectModel } from '../../models/shared/select.model';
import { EstadoAcuerdoModel } from '../../models/pedido/estado.model';
import { PerfilModel, PerfilNivelModel, PerfilNivelSubTipoModel } from '../../models/auth/perfil.model';
import { environment } from '@environments/environment';

interface State {
    perfiles: SelectModel[];
}

interface NivelesState {
    niveles: SelectModel[];
}

interface SubTiposState {
    subTipos: SelectModel[];
}

@Injectable({
    providedIn: 'root'
})
export class PerfilesStore {

    public msg = inject(NzMessageService);
    public http = inject(HttpClient);

    #perfilesResult = signal<State>({
        perfiles: [],
    });

    #nivelesResult = signal<NivelesState>({
        niveles: [],
    });

    #subTiposResult = signal<SubTiposState>({
        subTipos: [],
    });

    public perfiles = computed(() => this.#perfilesResult().perfiles);
    public niveles = computed(() => this.#nivelesResult().niveles);
    public subTipos = computed(() => this.#subTiposResult().subTipos);

    constructor() {
        this.listarPerfiles();

        this.listarNiveles();
    }


    listarPerfiles(): void {
        let params = new HttpParams();

        params = params.append('columnSort', `codigoPerfil`);
        params = params.append('typeSort', `descend`);
        params = params.append('piPageSize', 20);
        params = params.append('piCurrentPage', 1);

        this.http.get<ResponseModel>(`${environment.api}/Perfil/Listar`, { params }).subscribe(
            {
                next: (v: ResponseModel) => {
                    const res: PerfilModel[] = v.data;
                    let perfilesRes: SelectModel[] = [];

                    if (res == null) return;
                    res.forEach((x: PerfilModel) => {
                        perfilesRes.push(new SelectModel(x.codigoPerfil, x.descripcionPerfil));
                    });

                    this.#perfilesResult.set({
                        perfiles: perfilesRes,
                    });
                },
                error: (e) => console.error(e),
            }
        );
    }

    listarNiveles(esActivo: boolean = true): void {
        const params = new HttpParams().append('esActivo', esActivo.toString());

        this.http.get<ResponseModel>(`${environment.api}/Perfil/ListarNivel`, { params }).subscribe(
            {
                next: (v: ResponseModel) => {
                    const res: PerfilNivelModel[] = v.data;
                    let nivelesRes: SelectModel[] = [];

                    if (res == null) return;
                    res.forEach((x: PerfilNivelModel) => {
                        nivelesRes.push(new SelectModel(x.codigoNivel, x.descripcionNivel));
                    });

                    this.#nivelesResult.set({
                        niveles: nivelesRes,
                    });
                },
                error: (e) => console.error(e),
            }
        );
    }

    listarSubTipos(esActivo: boolean = true, codigoNivel: number = 1): void {
        const params = new HttpParams().append('esActivo', esActivo.toString()).append('codigoNivel', codigoNivel.toString());

        this.http.get<ResponseModel>(`${environment.api}/Perfil/ListarSubTipo`, { params }).subscribe(
            {
                next: (v: ResponseModel) => {
                    const res: PerfilNivelSubTipoModel[] = v.data;
                    let subTiposRes: SelectModel[] = [];

                    if (res == null) return;
                    res.forEach((x: PerfilNivelSubTipoModel) => {
                        subTiposRes.push(new SelectModel(x.codigoSubTipo, x.descripcionSubTipo));
                    });

                    this.#subTiposResult.set({
                        subTipos: subTiposRes,
                    });
                },
                error: (e) => console.error(e),
            }
        );
    }
}
