import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '../../../../environments/environment.development';
import { ResponseModel } from '../../models/shared/response.model';
import { SelectModel } from '../../models/shared/select.model';
import { EstadoAcuerdoModel } from '../../models/pedido/estado.model';
import { PerfilResponseModel } from '../../models/auth/perfil.model';

interface State {
    perfiles: SelectModel[];
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

    public perfiles = computed(() => this.#perfilesResult().perfiles);

    constructor() {
        this.listarPerfiles();
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
                    const res: PerfilResponseModel[] = v.data;
                    let perfilesRes: SelectModel[] = [];

                    if (res == null) return;
                    res.forEach((x: PerfilResponseModel) => {
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
}
