import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Pagination, ParametroResponse } from '@core/interfaces';
import { ParametrosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { BotonComponent } from '@shared/boton/boton/boton.component';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-parametros',
  standalone: true,
  imports: [CommonModule, NgZorroModule, PrimeNgModule, PageHeaderComponent, BotonComponent ],
  providers: [MessageService],
  templateUrl: './parametros.component.html',
  styles: ``
})
export class ParametrosComponent {

  parametros = signal<ParametroResponse[]>([])

  loading: boolean = false
  pagination: Pagination = {
    columnSort: 'parametroId',
    typeSort: 'ASC',
    currentPage: 1,
    pageSize: 10,
  }

  private parametroService = inject(ParametrosService)
  private messageService = inject(MessageService)

  ngOnInit(): void {
    this.ontenerParametrosService()
  }

  ontenerParametrosService(){
    this.loading = true
    this.parametroService.listarParametros(this.pagination)
      .subscribe( resp => {
        this.loading = false
        this.parametros.set(resp.data);
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    
  }

  nuevoParametro(){
    
  }
}
