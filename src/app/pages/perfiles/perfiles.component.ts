import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Pagination, PerfilResponse } from '@core/interfaces';
import { PerfilesService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { BotonComponent } from '@shared/boton/boton/boton.component';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { distinctUntilChanged, filter } from 'rxjs';

@Component({
  selector: 'app-perfiles',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, PrimeNgModule, NgZorroModule, BotonComponent],
  templateUrl: './perfiles.component.html',
  styles: ``
})
export default class PerfilesComponent {

  loading: boolean = false
  openFilters: boolean = false

  perfiles = signal<PerfilResponse[]>([])

  pagination:Pagination = {
    columnSort: 'codigoPerfil',
    typeSort: 'ASC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private perfilService = inject(PerfilesService)

  ngOnInit(): void {
    this.getParams()
  }

  getParams(){
    this.route.queryParams
      .pipe(
        filter(params => Object.keys(params).length > 0),
        distinctUntilChanged((prev,curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe( params => {
        let campo = params['campo'] ?? 'codigoPerfil'
        this.pagination.columnSort = campo
        this.pagination.currentPage = params['pagina']
        this.pagination.pageSize = params['cantidad']
        this.pagination.typeSort = params['ordenar'] ?? 'DESC'

        this.obtenerPerfiles()
      })
  }

  obtenerPerfiles(){
    this.perfilService.listarPerfiles(this.pagination)
      .subscribe( resp => {
        console.log(resp.data);
        
        this.perfiles.set(resp.data)
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
    const filterStorageExist = localStorage.getItem('filtrosPerfiles');
    let filtros:any = {}
    if(filterStorageExist){      
      filtros = JSON.parse(filterStorageExist)
      filtros.save = false      
      localStorage.setItem('filtrosPerfiles', JSON.stringify(filtros))
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
}
