import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '../../../../environments/environment.development';
import { ResponseModel } from '../../models/shared/response.model';
import { SelectModel } from '../../models/shared/select.model';
import { EstadoAcuerdoModel } from '../../models/pedido/estado.model';

interface State {
    estados: SelectModel[];
}

@Injectable({
    providedIn: 'root'
})
export class EstadosStore {

    public msg = inject(NzMessageService);
    public http = inject(HttpClient);

    #estadoAcuerdoResult = signal<State>({
        estados: [],
    });

    public estados = computed(() => this.#estadoAcuerdoResult().estados);

    constructor() {
        this.listarEstados();
    }


    listarEstados(tipo: number = 1): void {
        let params = new HttpParams()
            .append('tipo', `${tipo}`);

        this.http.get<ResponseModel>(`${environment.api}/EstadoTipo`, { params }).subscribe(
            {
                next: (v: ResponseModel) => {
                    const res: EstadoAcuerdoModel[] = v.data;
                    let estadosRes: SelectModel[] = [];

                    if (res == null) return;
                    res.forEach((x: EstadoAcuerdoModel) => {
                        estadosRes.push(new SelectModel(Number(x.id), x.nombre));
                    });

                    this.#estadoAcuerdoResult.set({
                        estados: estadosRes,
                    });
                },
                error: (e) => console.error(e),
            }
        );
    }
}
