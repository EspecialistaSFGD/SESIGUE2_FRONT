import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '../../../../environments/environment.development';
import { ResponseModel } from '../../models/shared/response.model';
import { SelectModel } from '../../models/shared/select.model';
import { ClasificacionAcuerdoModel } from '../../models/shared/clasficacion.model';

interface State {
    clasificaciones: SelectModel[];
}

@Injectable({
    providedIn: 'root'
})
export class ClasificacionesStore {

    public msg = inject(NzMessageService);
    public http = inject(HttpClient);

    #clasificacionesAcuerdoResult = signal<State>({
        clasificaciones: [],
    });

    public clasificaciones = computed(() => this.#clasificacionesAcuerdoResult().clasificaciones);

    constructor() {
        this.listarClasificaciones();
    }


    listarClasificaciones(grupoId: number = 0, tipo: number = 3): void {
        let params = new HttpParams()
            .append('grupoId', `${grupoId}`)
            .append('tipo', `${tipo}`);

        this.http.get<ResponseModel>(`${environment.api}/Sector`, { params }).subscribe(
            {
                next: (v: ResponseModel) => {
                    const res: ClasificacionAcuerdoModel[] = v.data;
                    let clasificacionesRes: SelectModel[] = [];

                    if (res == null) return;
                    res.forEach((x: ClasificacionAcuerdoModel) => {
                        clasificacionesRes.push(new SelectModel(Number(x.grupoID), x.nombre));
                    });

                    this.#clasificacionesAcuerdoResult.set({
                        clasificaciones: clasificacionesRes,
                    });
                },
                error: (e) => console.error(e),
            }
        );
    }
}
