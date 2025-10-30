import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { Pagination, PerfilResponse } from '@core/interfaces';
import { AccesoResponse } from '@core/interfaces/acceso.interface';
import { AccesosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { BotonComponent } from '@shared/boton/boton/boton.component';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-accesos-perfil',
  standalone: true,
  imports: [CommonModule, NgZorroModule, BotonComponent],
  templateUrl: './accesos-perfil.component.html',
  styles: ``
})
export class AccesosPerfilComponent {
  @Input() perfil: PerfilResponse = {} as PerfilResponse

  loading: boolean = false
  openFilters: boolean = false

  pagination: Pagination = {
    columnSort: 'M.ordenItem',
    typeSort: 'ASC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  accesos = signal<AccesoResponse[]>([])

  private accesoService = inject(AccesosService)

  ngOnInit(): void {
    // this.obtenerAccesosServices()
  }

  obtenerAccesosServices(){
    this.loading = true
    this.accesoService.ListarAccesos({...this.pagination, perfilId: this.perfil.perfilId})
      .subscribe( resp => {
        this.loading = false
        this.accesos.set(resp.data)
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
    const filterStorageExist = localStorage.getItem('filtrosAccesos');
    let filtros:Pagination = this.pagination
    if(filterStorageExist){      
      filtros = JSON.parse(filterStorageExist)
      filtros.save = false      
      localStorage.setItem('filtrosAccesos', JSON.stringify(filtros))
    }
    console.log(params);
    console.log(filtros);
    
    this.pagination = {...filtros, currentPage: params.pageIndex, pageSize: params.pageSize }
    this.obtenerAccesosServices()
  }
}
