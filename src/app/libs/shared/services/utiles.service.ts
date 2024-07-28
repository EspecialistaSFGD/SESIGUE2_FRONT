import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { SelectModel } from '../../models/shared/select.model';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { parse } from 'date-fns';

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

    stringToDate(dateString: string | null): Date | null {
        if (dateString == null) {
            return null;
        }

        const date = parse(dateString, 'dd/MM/yyyy', new Date());

        // Verifica si la fecha es válida
        if (isNaN(date.getTime())) {
            return null;
        }

        return date;
    }

    isEmptyObject(obj: object): boolean {
        return Object.keys(obj).length === 0;
    }
}
