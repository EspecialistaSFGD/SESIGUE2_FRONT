import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '../../../../environments/environment.development';
import { ResponseModel } from '../../models/shared/response.model';
import { SelectModel } from '../../models/shared/select.model';
import { EstadoAcuerdoModel } from '../../models/pedido/estado.model';
import { SectorModel } from '../../models/shared/sector.model';

interface State {
    tiposIntervencion: SelectModel[];
    ejesEstrategicos: SelectModel[];
}

@Injectable({
    providedIn: 'root'
})
export class PedidosStore {

    public msg = inject(NzMessageService);
    public http = inject(HttpClient);

    #pedidosResult = signal<State>({
        tiposIntervencion: [],
        ejesEstrategicos: [],
    });

    public tiposIntervencion = computed(() => this.#pedidosResult().tiposIntervencion);
    public ejesEstrategicos = computed(() => this.#pedidosResult().ejesEstrategicos);

    constructor() {
        this.listarTipos(5);
        this.listarTipos(6);
    }

    listarTipos(tipo: number = 5, grupoId: number = 0): void {
        let params = new HttpParams()
            .append('tipo', `${tipo}`)
            .append('grupoId', `${grupoId}`);

        this.http.get<ResponseModel>(`${environment.api}/Sector`, { params }).subscribe(
            {
                next: (v: ResponseModel) => {
                    const res: SectorModel[] = v.data;
                    let estadosRes: SelectModel[] = [];

                    if (res == null) return;
                    res.forEach((x: SectorModel) => {
                        estadosRes.push(new SelectModel(Number(x.grupoID), x.nombre));
                    });

                    switch (tipo) {
                        case 5:
                            this.#pedidosResult.update((state) => ({ ...state, tiposIntervencion: estadosRes }));
                            break;

                        case 6:
                            this.#pedidosResult.update((state) => ({ ...state, ejesEstrategicos: estadosRes }));
                            break;

                        default:
                            break;
                    }
                },
                error: (e) => console.error(e),
            }
        );
    }
}
