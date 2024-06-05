import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { SelectModel } from '../../models/select.model';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
    providedIn: 'root'
})
export class UtilesService {

    public http = inject(HttpClient);

    constructor() { }

    base64ToArrayBuffer(base64: any) {
        var binary_string = window.atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    descargarArchivo(id: string): Observable<any[]> {
        return this.http.get(`${environment.api}/Archivo/Descargar/${id}`).pipe(
            map((resp: any) => {

                return resp;
            }),
            catchError((error) => of([]))
        );
    }
}
