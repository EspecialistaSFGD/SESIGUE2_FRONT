import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from './../../../environments/environment';
import { NzMessageService } from 'ng-zorro-antd/message';


@Injectable({
    providedIn: 'root'
})
export class BaseHttpService {
    http = inject(HttpClient);
    msg = inject(NzMessageService);
    apiUrl = environment.api;

    constructor() { }
}
