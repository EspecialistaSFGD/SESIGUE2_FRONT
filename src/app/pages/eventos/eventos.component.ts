import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { EventoResponse, Pagination, TipoEventoResponse } from '@core/interfaces';
import { EventosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { EstadoTagComponent } from '@shared/estado-tag/estado-tag.component';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { FiltroEventosComponent } from './filtro-eventos/filtro-eventos.component';
import { deleteKeysToObject, setParamsToObject } from '@core/helpers';
import { distinctUntilChanged, filter } from 'rxjs';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, RouterModule, NgZorroModule, EstadoTagComponent, FiltroEventosComponent],
  templateUrl: './eventos.component.html',
  styles: ``
})
export default class EventosComponent {
  loading: boolean = false
  openFilters: boolean = false
  loadingExport: boolean = false
  pagination: Pagination = {
    columnSort: 'eventoId',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  eventos = signal<EventoResponse[]>([])
  tipoEventos = signal<TipoEventoResponse[]>([])

  private eventoService = inject(EventosService)
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
        this.loading = true
        const estado = params['estado'] ?? ''
        const tipoEspacioId = params['tipoEspacioId'] ?? ''
        let campo = params['campo'] ?? 'eventoId'
        this.pagination.columnSort = campo
        this.pagination.currentPage = params['pagina']
        this.pagination.pageSize = params['cantidad']
        this.pagination.typeSort = params['ordenar'] ?? 'DESC'
        
        setParamsToObject(params, this.pagination, 'nombre')
        setParamsToObject(params, this.pagination, 'estado')          
        setParamsToObject(params, this.pagination, 'tipoEventoId')
        this.obtenerEventoService(estado,tipoEspacioId)
      })
  }

  obtenerEventoService(estados: string, tipoEspacioId: string){
    this.loading = true
    const tipoEspacio = tipoEspacioId ? [tipoEspacioId] : []
    const estado = estados ? [estados] : []    
    this.eventoService.ListarEventos(this.pagination,estado,tipoEspacio)
      .subscribe( resp => {
        this.eventos.set(resp.data)
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
    const filtrosSaved = localStorage.getItem('filtrosEventos');
    let filtros:any = {}
    if(filtrosSaved){
      filtros = JSON.parse(filtrosSaved)
      filtros.save = false      
      localStorage.setItem('filtrosEventos', JSON.stringify(filtros))
    }    
    this.paramsNavigate({...filtros, pagina: params.pageIndex, cantidad: params.pageSize, campo, ordenar, save: null })    
  }

  generateFilters(pagination: Pagination){
    const paramsInvalid: string[] = ['pageIndex','pageSize','columnSort','code','typeSort','currentPage','total']
    const params = deleteKeysToObject(pagination, paramsInvalid)
    this.paramsNavigate(params)
  }

  saveFilters(save: boolean){
    if(save){
      const pagination: any = { ...this.pagination };
      pagination.pagina = pagination.currentPage
      pagination.cantidad = pagination.pageSize
      pagination.save = true
      if(pagination.columnSort != 'eventoId' &&  pagination.typeSort != 'DESC' ){
        pagination.campo = pagination.columnSort
        pagination.ordenar = pagination.typeSort
      }
  
      delete pagination.currentPage
      delete pagination.pageSize
      delete pagination.columnSort
      delete pagination.typeSort
      delete pagination.code
      delete pagination.total
  
      localStorage.setItem('filtrosEventos', JSON.stringify(pagination));
    }
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

  crearEvento(){

  }
}
