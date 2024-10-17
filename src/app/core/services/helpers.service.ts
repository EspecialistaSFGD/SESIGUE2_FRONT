import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pagination } from '@interfaces/pagination.interface';

@Injectable({
  providedIn: 'root'
})
export class HelpersService {

  getAutorizationToken() {
    const { codigo, expiracionToken } = JSON.parse(localStorage.getItem('token') || '')
    return new HttpHeaders().set('Autorization', `Bearer ${codigo}`)
  }

  setParams(pagination: Pagination) {
    pagination.code = Number(localStorage.getItem('codigoUsuario')) ?? 0
    let httpParams = new HttpParams();
    const params = Object.entries(pagination).map(([key, value]) => { return { key, value } })
    for (let param of params) {
      httpParams = httpParams.append(param.key, param.value);
    }
    return httpParams
  }
}
