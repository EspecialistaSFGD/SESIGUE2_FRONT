import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccesoDetalleResponse, AccesoResponse, Pagination } from '@core/interfaces';
import { AccesoDetalleService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { BotonComponent } from '@shared/boton/boton/boton.component';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-acceso-detalle-acceso-perfil',
  standalone: true,
  imports: [CommonModule, NgZorroModule, BotonComponent],
  templateUrl: './acceso-detalle-acceso-perfil.component.html',
  styles: ``
})
export class AccesoDetalleAccesoPerfilComponent {
  @Input() acceso: AccesoResponse = {} as AccesoResponse

  loading: boolean = false
  openFilters: boolean = false

  pagination: Pagination = {
    columnSort: 'codigoAccesoDetalle',
    typeSort: 'ASC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  accesoDetalles = signal<AccesoDetalleResponse[]>([])

  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private accesoDetalleService = inject(AccesoDetalleService)

  obtenerAccesoDetallesServices(){
    this.loading = true
    this.accesoDetalleService.ListarAccesoDetalle({...this.pagination, accesoId: this.acceso.accesoId})
      .subscribe( resp => {
        this.loading = false
        this.accesoDetalles.set(resp.data)
        this.pagination.total = resp.info?.total
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const sortsNames = ['ascend', 'descend']
    const sorts = params.sort.find(item => sortsNames.includes(item.value!))
    params.sort.reduce((total, item) => {
      return sortsNames.includes(item.value!) ? total + 1 : total
    }, 0)

    const campo = sorts?.key
    const ordenar = sorts?.value!.slice(0, -3)
    const filterStorageExist = localStorage.getItem('filtrosAccesoDetalles');
    let filtros:Pagination = this.pagination
    if(filterStorageExist){      
      filtros = JSON.parse(filterStorageExist)
      filtros.save = false      
      localStorage.setItem('filtrosAccesoDetalles', JSON.stringify(filtros))
    }

    this.pagination = {...filtros, currentPage: params.pageIndex, pageSize: params.pageSize }
    this.obtenerAccesoDetallesServices()
  }
}
