import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  public msg = inject(NzMessageService);
  public http = inject(HttpClient);
  private router = inject(Router);

  constructor() { }
}
