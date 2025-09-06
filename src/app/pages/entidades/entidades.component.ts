import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { deleteKeysToObject, setParamsToObject } from '@core/helpers';
import { EntidadResponse, Pagination } from '@core/interfaces';
import { EntidadesService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { FiltroEntidadComponent } from './filtro-entidad/filtro-entidad.component';

@Component({
  selector: 'app-entidades',
  standalone: true,
  imports: [CommonModule, RouterModule, NgZorroModule, PageHeaderComponent, FiltroEntidadComponent],
  templateUrl: './entidades.component.html',
  styles: ``
})
export default class EntidadesComponent {

  loading: boolean = false
  openFilters: boolean = false
  entidades = signal<EntidadResponse[]>([])

  private entidadService = inject(EntidadesService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)

  pagination: Pagination = {
    columnSort: 'entidadId',
    typeSort: 'ASC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  ngOnInit(): void {
    this.getParams()
  }

  getParams() {
      this.route.queryParams.subscribe(params => { 
        this.loading = true
        let tipoUbigeo = ''
        if (Object.keys(params).length > 0) {        
          let campo = params['campo'] ?? 'entidadId'
          tipoUbigeo = params['tipoUbigeo'] ?? ''
  
          this.pagination.columnSort = campo
          this.pagination.currentPage = params['pagina']
          this.pagination.pageSize = params['cantidad']
          this.pagination.typeSort = params['ordenar'] ?? 'ASC'
          
          setParamsToObject(params, this.pagination, 'entidad')
          setParamsToObject(params, this.pagination, 'ubigeo')          
          setParamsToObject(params, this.pagination, 'tipoEntidad')     
          setParamsToObject(params, this.pagination, 'tipoUbigeo')          
        }
        setTimeout(() => this.obtenerEntidadesService(tipoUbigeo), 500);
      })
    }

  obtenerEntidadesService(tipo:string){
    const ubigeoValidos = ['R','D','P']
    const setTipo:string[] = ubigeoValidos.includes(tipo) ? ubigeoValidos : [tipo]
    const subTipos:string[] = tipo ? setTipo : ['MR','MM','R','D','P']
    this.entidadService.listarEntidades(this.pagination, subTipos)
      .subscribe( resp => {
        this.entidades.set(resp.data)        
        this.pagination.total = resp.info?.total
        this.loading = false
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const sortsNames = ['ascend', 'descend']
    const sorts = params.sort.find(item => sortsNames.includes(item.value!))
    const qtySorts = params.sort.reduce((total, item) => {
      return sortsNames.includes(item.value!) ? total + 1 : total
    }, 0)
    const campo = sorts?.key
    const ordenar = sorts?.value!.slice(0, -3)
    const filtrosSaved = localStorage.getItem('filtrosEntidades');
    let filtros:any = {}
    if(filtrosSaved){
      filtros = JSON.parse(filtrosSaved)
      filtros.save = false      
      localStorage.setItem('filtrosEntidades', JSON.stringify(filtros))
    }
    this.paramsNavigate({...filtros, pagina: params.pageIndex, cantidad: params.pageSize, campo, ordenar, save: null })
  }

  saveFilters(save: boolean){
    console.log(this.pagination);
    
    if(save){
      const pagination: any = { ...this.pagination };
      pagination.pagina = pagination.currentPage
      pagination.cantidad = pagination.pageSize
      pagination.save = true
      if(pagination.columnSort != 'entidadId' &&  pagination.typeSort != 'ASC' ){
        pagination.campo = pagination.columnSort
        pagination.ordenar = pagination.typeSort
      }
  
      delete pagination.currentPage
      delete pagination.pageSize
      delete pagination.columnSort
      delete pagination.typeSort
      delete pagination.code
      delete pagination.total
  
      localStorage.setItem('filtrosEntidades', JSON.stringify(pagination));
    }
  }

  generateFilters(pagination: Pagination){
    const paramsInvalid: string[] = ['pageIndex','pageSize','columnSort','code','typeSort','currentPage','total','departamento','provincia','distrito','tipoMancomunidad','mancomunidad']
    const params = deleteKeysToObject(pagination, paramsInvalid)
    this.paramsNavigate(params)
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

}
