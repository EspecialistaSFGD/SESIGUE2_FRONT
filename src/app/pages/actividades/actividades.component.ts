import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { setParamsToObject } from '@core/helpers';
import { ActividadResponse, Pagination } from '@core/interfaces';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { BotonComponent } from '@shared/boton/boton/boton.component';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { distinctUntilChanged, filter } from 'rxjs';

@Component({
  selector: 'app-actividades',
  standalone: true,
  imports: [CommonModule, NgZorroModule, PageHeaderComponent, BotonComponent],
  templateUrl: './actividades.component.html',
  styles: ``
})
export class ActividadesComponent {

  actividades = signal<ActividadResponse[]>([]);

  loading: boolean = false;
  openFilters: boolean = false;

  pagination: Pagination = {
    columnSort: 'actividadId',
    typeSort: 'DESC',
    currentPage: 1,
    pageSize: 10,
    total: 0
  };

  private router = inject(Router);
  private route = inject(ActivatedRoute)

  ngOnInit(): void {
    this.getParams()
  }


  getParams() {
    this.route.queryParams
      .pipe(
        filter(params => Object.keys(params).length > 0),
        distinctUntilChanged((prev,curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe( params => {   
        let campo = params['campo'] ?? 'mesaId'

        this.pagination.columnSort = campo
        this.pagination.currentPage = params['pagina']
        this.pagination.pageSize = params['cantidad']
        this.pagination.typeSort = params['ordenar'] ?? 'DESC'

        setParamsToObject(params, this.pagination, 'nombre')
        setParamsToObject(params, this.pagination, 'sectorId')
        setParamsToObject(params, this.pagination, 'sectorEntidadId')
        setParamsToObject(params, this.pagination, 'entidadId')
        setParamsToObject(params, this.pagination, 'ubigeo')
        setParamsToObject(params, this.pagination, 'entidadUbigeoId')        

        this.obtenerActividadesService()
    })
  }

  obtenerActividadesService(){

  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const sortsNames = ['ascend', 'descend']
    const sorts = params.sort.find(item => sortsNames.includes(item.value!))
    const qtySorts = params.sort.reduce((total, item) => {
      return sortsNames.includes(item.value!) ? total + 1 : total
    }, 0)
    const campo = sorts?.key
    const ordenar = sorts?.value!.slice(0, -3)
    const filtrosMesas = localStorage.getItem('filtrosActividades');
    let filtros:any = {}
    if(filtrosMesas){
      filtros = JSON.parse(filtrosMesas)
      filtros.save = false      
      localStorage.setItem('filtrosActividades', JSON.stringify(filtros))
    }
    this.paramsNavigate({...filtros, pagina: params.pageIndex, cantidad: params.pageSize, campo, ordenar, save: null })
  }

  paramsNavigate(queryParams: Params){    
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams,
        queryParamsHandling: 'merge',
      }
    );
  }


  crearActividad(){
    
  }
}
