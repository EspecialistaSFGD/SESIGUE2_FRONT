import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { EntidadResponse, Pagination } from '@core/interfaces';
import { EntidadesService } from '@core/services';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-entidades',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './entidades.component.html',
  styles: ``
})
export default class EntidadesComponent {

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
    const subTipos:string[] = ['MR','MM','R','D','P']
    this.entidadService.listarEntidades(this.pagination, subTipos)
      .subscribe( resp => {
        this.entidades.set(resp.data)
        console.log(resp.data);
        
        this.pagination.total = resp.info?.total
      })
  }

}
