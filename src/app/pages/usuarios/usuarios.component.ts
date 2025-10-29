import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { deleteKeysToObject, obtenerPermisosBotones, permisosPCM } from '@core/helpers';
import { ButtonsActions, Pagination, UsuarioResponse } from '@core/interfaces';
import { UsuariosService } from '@core/services/usuarios.service';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { AuthService } from '@libs/services/auth/auth.service';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { UtilesService } from '@libs/shared/services/utiles.service';
import { BotonComponent } from '@shared/boton/boton/boton.component';
import saveAs from 'file-saver';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { distinctUntilChanged, filter } from 'rxjs';
import { FiltrosUsuarioComponent } from './filtros-usuario/filtros-usuario.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, NgZorroModule, PageHeaderComponent, FiltrosUsuarioComponent, BotonComponent],
  templateUrl: './usuarios.component.html',
  styles: ``
})
export default class UsuariosComponent {
  title: string = `Lista de Puntos focales`;
    
  loadingData: boolean = false
  loadingExport: boolean = false
  openFilter:boolean = false
  permisosPCM: boolean = false
  perfilAuth: number = 0
  nivelAuth: boolean = false

  pagination: Pagination = {
    code: 0,
    columnSort: 'nombresPersona',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }
  paginationFilter: Pagination = {}
  usuarioPermisos: ButtonsActions = {}

  usuarios = signal<UsuarioResponse[]>([])

  private router = inject(Router);
  private route = inject(ActivatedRoute)
  private usuariosService = inject(UsuariosService)
  private utilesService = inject(UtilesService);
  
    private authStore = inject(AuthService)

  ngOnInit(): void {
    this.perfilAuth = this.authStore.usuarioAuth().codigoPerfil!
    const tipoStorage = localStorage.getItem('descripcionTipo') || ''
    this.nivelAuth = tipoStorage == 'GN'
    this.permisosPCM = permisosPCM(this.perfilAuth)
    this.getPermissions()
    this.getParams()
  }

  getPermissions() {
      const navigation = this.authStore.navigationAuth()!
      const usuariosNav = navigation.find(nav => nav.descripcionItem == 'Puntos Focales' && nav.parentMenu == 0)  
      this.usuarioPermisos = usuariosNav ? obtenerPermisosBotones(usuariosNav!.botones!) : {}
    }

  getParams() {
    this.route.queryParams
      .pipe(
        filter(params => Object.keys(params).length > 0),
        distinctUntilChanged((prev,curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe( params => {
        let columnSort = params['campo'] ?? 'nombresPersona'
        this.pagination.columnSort = columnSort
        this.pagination.currentPage = Number(params['pagina'])
        this.pagination.pageSize = Number(params['cantidad'])
        this.pagination.typeSort = params['ordenar'] ?? 'DESC'

        this.setPaginationValueToParams(params, 'documentoNumero')
        this.setPaginationValueToParams(params, 'perfil')
        this.setPaginationValueToParams(params, 'tipo')
        this.setPaginationValueToParams(params, 'sectorId')
        this.setPaginationValueToParams(params, 'entidadId')
        this.setPaginationValueToParams(params, 'ubigeo')

        this.obtenerUsuariosService()
      })
  }

  setPaginationValueToParams(params: Params, param: string){
      const keyParam = param as keyof Pagination;
      if(params[param]){
        this.pagination[keyParam] = params[param];
        this.paginationFilter[keyParam] = params[param];
      } else {
        delete this.pagination[keyParam]
        delete this.paginationFilter[keyParam]
      }
    }

  obtenerUsuariosService(){    
    this.loadingData = true
    this.usuariosService.listarUsuario(this.pagination)
      .subscribe( resp => {
        this.loadingData = false        
        this.usuarios.set(resp.data)
        this.pagination.total = resp.info?.total
      })
  }

  reporteUsuarios(tipo: string){
    this.pagination.tipo = tipo
    this.loadingExport = true
    this.usuariosService.reporteUsuarios(this.pagination)
      .subscribe( resp => {
        this.loadingExport = false
        if(resp.data){
          const data = resp.data;
          this.generarExcel(data.archivo, data.nombreArchivo);
          this.loadingExport = false
        }
      })
  }

  generarExcel(archivo: any, nombreArchivo: string): void {
      const arrayBuffer = this.utilesService.base64ToArrayBuffer(archivo);
      const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, nombreArchivo);
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const sortsNames = ['ascend', 'descend']
    const sorts = params.sort.find(item => sortsNames.includes(item.value!))
    params.sort.reduce((total, item) => {
      return sortsNames.includes(item.value!) ? total + 1 : total
    }, 0)

    const campo = sorts?.key
    const ordenar = sorts?.value!.slice(0, -3)
    const filterStorageExist = localStorage.getItem('filtrosPuntosFocales');
    let filtros:any = {}
    if(filterStorageExist){      
      filtros = JSON.parse(filterStorageExist)
      filtros.save = false      
      localStorage.setItem('filtrosPuntosFocales', JSON.stringify(filtros))
    }    
    this.paramsNavigate({...filtros, pagina: params.pageIndex, cantidad: params.pageSize, campo, ordenar, save: null })
  }

  // getFilterDrawer(pagination: Pagination){
  //   const documentoNumero = pagination.documentoNumero ? pagination.documentoNumero : null
  //   const sectorId = pagination.sectorId ? pagination.sectorId : null
  //   const ubigeo = pagination.ubigeo ? pagination.ubigeo : null
  //   const entidadId = pagination.entidadId ? pagination.entidadId : null
  //   const perfil = pagination.perfil ? pagination.perfil : null
  //   this.paramsNavigate({documentoNumero, sectorId, ubigeo, entidadId, perfil})
  // }

  generateFilters(pagination: Pagination){
      // const paramsInvalid: string[] = ['pageIndex','pageSize','columnSort','code','typeSort','currentPage','total','departamento','provincia','distrito']
      // const params = deleteKeysToObject(pagination, paramsInvalid)
      this.paramsNavigate(pagination)
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
