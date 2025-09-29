import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pagination, PaginationPanel } from '@core/interfaces/pagination.interface';

@Injectable({
  providedIn: 'root'
})
export class HelpersService {

  getAutorizationToken() {
    const { codigo, expiracionToken } = JSON.parse(localStorage.getItem('token') || '')
    return new HttpHeaders().set('Autorization', `Bearer ${codigo}`)
  }

  setParams(pagination: Pagination | PaginationPanel) {
    let httpParams = new HttpParams();
    const params = Object.entries(pagination).map(([key, value]) => { return { key, value } })
    for (let param of params) {
      // httpParams = httpParams.append(param.key, param.value);
      if (Array.isArray(param.value)) {
        param.value.forEach((value: any) => {
           httpParams = httpParams.append(`${param.key}[]`, value);
        })
      } else {
         httpParams = httpParams.append(param.key, param.value);
      }
    }
    if (httpParams.has('code')) {
      const userCode = Number(localStorage.getItem('codigoUsuario')) ?? 0
      httpParams = httpParams.set('code', userCode);
    }

    return httpParams
  }
}
