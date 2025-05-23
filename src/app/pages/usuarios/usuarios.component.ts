import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ButtonsActions, Pagination, PerfilResponse, SectorResponse, UbigeoDepartmentResponse, UsuarioResponse } from '@core/interfaces';
import { UsuariosService } from '@core/services/usuarios.service';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { FiltrosUsuarioComponent } from './filtros-usuario/filtros-usuario.component';
import saveAs from 'file-saver';
import { UtilesService } from '@libs/shared/services/utiles.service';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PerfilesService, SectoresService, UbigeosService } from '@core/services';
import { AuthService } from '@libs/services/auth/auth.service';
import { obtenerPermisosBotones, permisosPCM } from '@core/helpers';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, NgZorroModule, PageHeaderComponent, FiltrosUsuarioComponent],
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
  sectores = signal<SectorResponse[]>([])
  departamentos = signal<UbigeoDepartmentResponse[]>([])
  perfiles = signal<PerfilResponse[]>([])

  private router = inject(Router);
  private route = inject(ActivatedRoute)
  private usuariosService = inject(UsuariosService)
  private utilesService = inject(UtilesService);
  private sectoresService = inject(SectoresService)
  private ubigeoService = inject(UbigeosService)
  private perfilesService = inject(PerfilesService)
  
    private authStore = inject(AuthService)

  ngOnInit(): void {
    this.perfilAuth = this.authStore.usuarioAuth().codigoPerfil!
    const tipoStorage = localStorage.getItem('descripcionTipo') || ''
    this.nivelAuth = tipoStorage == 'GN'
    this.permisosPCM = permisosPCM(this.perfilAuth)
    this.getPermissions()
    this.obtenerSectoresService()
    this.obtenerDepartamentosService()
    this.obtenePerfilesService()
    this.getParams()
  }

  getPermissions() {
      const navigation = this.authStore.navigationAuth()!
      const usuariosNav = navigation.find(nav => nav.descripcionItem == 'Puntos Focales' && nav.parentMenu == 0)  
      this.usuarioPermisos = usuariosNav ? obtenerPermisosBotones(usuariosNav!.botones!) : {}
    }

  getParams() {
    this.route.queryParams.subscribe((params: Params) => {
      if (Object.keys(params).length > 0) {
        let columnSort = params['campo'] ?? 'nombresPersona'
        this.pagination.columnSort = columnSort
        this.pagination.currentPage = Number(params['pagina'])
        this.pagination.pageSize = Number(params['cantidad'])
        this.pagination.typeSort = params['ordenar'] ?? 'DESC'

        this.setPaginationValueToParams(params, 'documentoNumero')
        this.setPaginationValueToParams(params, 'sectorId')
        this.setPaginationValueToParams(params, 'entidadId')
        this.setPaginationValueToParams(params, 'perfil')
        
        this.obtenerUsuariosService()
      }
    });
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


  obtenePerfilesService(){
    const paginationPerfil: Pagination = {
      columnSort: 'descripcionPerfil',
      typeSort: 'ASC',
      pageSize: 50,
      currentPage: 1
    }
    this.perfilesService.listarPerfiles(paginationPerfil)
      .subscribe( resp => {
        this.perfiles.set(resp.data)
      })
  }

  obtenerDepartamentosService(){
    this.ubigeoService.getDepartments()
      .subscribe(resp => {
        this.departamentos.set(resp.data) 
      })
  }

  obtenerSectoresService(){
    this.sectoresService.getAllSectors(0, 2)
      .subscribe( resp => {
        this.sectores.set(resp.data)
        this.pagination.total = resp.info?.total
      }
    )
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
    const { pageSize, pageIndex } = params;
    this.paramsNavigate({ pagina: pageIndex, cantidad: pageSize });
  }

  getFilterDrawer(pagination: Pagination){
    const documentoNumero = pagination.documentoNumero ? pagination.documentoNumero : null
    const sectorId = pagination.sectorId ? pagination.sectorId : null
    const ubigeo = pagination.ubigeo ? pagination.ubigeo : null
    const entidadId = pagination.entidadId ? pagination.entidadId : null
    const perfil = pagination.perfil ? pagination.perfil : null
    this.paramsNavigate({documentoNumero, sectorId, ubigeo, entidadId, perfil})
  }

  exportToFilters(){
    let report = 'todos'
    if(!this.permisosPCM){
      report = this.nivelAuth ? 'gore' : 'sector'
    }    
    this.reporteUsuarios(report)
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
