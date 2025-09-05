import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EntidadResponse, Pagination } from '@core/interfaces';
import { EntidadesService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-entidades',
  standalone: true,
  imports: [CommonModule, RouterModule, NgZorroModule, PageHeaderComponent],
  templateUrl: './entidades.component.html',
  styles: ``
})
export default class EntidadesComponent {

  loading: boolean = false
  entidades = signal<EntidadResponse[]>([])

  private entidadService = inject(EntidadesService)

  pagination: Pagination = {
    columnSort: 'entidadId',
    typeSort: 'ASC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  ngOnInit(): void {
    this.obtenerEntidadesService()
  }

  obtenerEntidadesService(){
    this.loading = true
    const subTipos:string[] = ['MR','MM','R','D','P']
    this.entidadService.listarEntidades(this.pagination, subTipos)
      .subscribe( resp => {
        this.entidades.set(resp.data)        
        this.pagination.total = resp.info?.total
        this.loading = false
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    
  }

}
