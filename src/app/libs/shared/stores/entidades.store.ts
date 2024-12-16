import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
// import { environment } from '../../../../environments/environment.development';
import { ResponseModel } from '../../models/shared/response.model';
import { SelectModel } from '../../models/shared/select.model';
import { EntidadModel } from '../../models/shared/entidad.model';
import { PerfilModel } from '../../models/auth/perfil.model';
import { environment } from '@environments/environment';

interface State {
    entidades: SelectModel[];
    entidadSeleccionada?: SelectModel | null;
    perfiles: SelectModel[];
}

@Injectable({
    providedIn: 'root'
})
export class EntidadesStore {

    public msg = inject(NzMessageService);
    public http = inject(HttpClient);

    #entidadesResult = signal<State>({
        entidades: [],
        entidadSeleccionada: null,
        perfiles: [],
    });

    public entidades = computed(() => this.#entidadesResult().entidades);
    public entidadSeleccionada = computed(() => this.#entidadesResult().entidadSeleccionada);
    public perfiles = computed(() => this.#entidadesResult().perfiles);

    constructor() { }

    listarEntidades(id: number = 0, tipo: number = 0, sectorId: number | null = 0, ubigeo: number = 0): void {
        let params = new HttpParams();

        params = params.append('entidadId', `${id}`);
        params = params.append('tipo', `${tipo}`);

        if (sectorId != null) params = params.append('sectorId', `${sectorId}`);
        if (ubigeo > 0) params = params.append('ubigeo', `${ubigeo}`);

        this.http.get<ResponseModel>(`${environment.api}/Entidad/Listar`, { params }).subscribe(
            {
                next: (v: ResponseModel) => {
                    const res: EntidadModel[] = v.data;
                    let entidadesRes: SelectModel[] = [];
                    let entidadSeleccionada: SelectModel | null = null;

                    if (res == null) return;
                    res.forEach((x: EntidadModel) => {
                        entidadesRes.push(new SelectModel(Number(x.entidadId), x.nombre));

                        // if (x.vigente == 1 && entidadSeleccionada == null) {
                        //   entidadSeleccionada = new SelectModel(Number(x.entidadId), x.nombre);
                        // }
                    });

                    this.#entidadesResult.update((v) => ({ ...v, entidades: entidadesRes, entidadSeleccionada: entidadSeleccionada }));
                },
                error: (e) => console.error(e),
            }
        );
    }

    listarPerfiles(entidadId: number): void {
        let params = new HttpParams()
            .append('entidadId', `${entidadId}`)
            .append('typeSort', 'ascend')
            .append('piPageSize', 10)
            .append('piCurrentPage', 1)
            .append('columnSort', 'codigoPerfil');

        this.http.get<ResponseModel>(`${environment.api}/Perfil/Listar`, { params }).subscribe(
            {
                next: (v: ResponseModel) => {
                    const res: PerfilModel[] = v.data;
                    let perfilesRes: SelectModel[] = [];

                    if (res == null) return;
                    res.forEach((x: PerfilModel) => {
                        perfilesRes.push(new SelectModel(Number(x.codigoPerfil), x.descripcionPerfil));
                    });

                    this.#entidadesResult.update((v) => ({ ...v, perfiles: perfilesRes }));

                },
                error: (e) => console.error(e),
            }
        );
    }
}
