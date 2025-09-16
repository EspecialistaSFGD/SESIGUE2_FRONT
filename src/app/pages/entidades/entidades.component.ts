import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { deleteKeysToObject, obtenerAutoridadJne, obtenerPermisosBotones, setParamsToObject } from '@core/helpers';
import { AsistenteResponse, AutoridadResponse, ButtonsActions, EntidadResponse, JneAutoridadParams, Pagination } from '@core/interfaces';
import { AsistentesService, AutoridadesService, EntidadesService, JneService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { catchError, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { FiltroEntidadComponent } from './filtro-entidad/filtro-entidad.component';
import { AuthService } from '@libs/services/auth/auth.service';
import { JneAutoridadTipoEnum } from '@core/enums';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-entidades',
  standalone: true,
  imports: [CommonModule, RouterModule, NgZorroModule, PageHeaderComponent, FiltroEntidadComponent],
  templateUrl: './entidades.component.html',
  styles: ``
})
export default class EntidadesComponent {

  loading: boolean = false
  loadingAutoridad: boolean = false
  openFilters: boolean = false
  perfilAuth: number = 0
  permisosPCM: boolean = false
  esAdmin:boolean = false
  entidades = signal<EntidadResponse[]>([])

  entidadesActions: ButtonsActions = {}

  private entidadService = inject(EntidadesService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private authStore = inject(AuthService)
  private jneService = inject(JneService)
  private asistenteService = inject(AsistentesService)
  private autoridadService = inject(AutoridadesService)

  pagination: Pagination = {
    columnSort: 'entidadId',
    typeSort: 'ASC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  ngOnInit(): void {
    this.getPermissions()
    this.getPermisos()
    this.getParams()
  }

  getPermissions() {
    const navigation = this.authStore.navigationAuth()!
    const transferenciaRecursos = navigation.find(nav => nav.descripcionItem == 'Entidades')
    this.entidadesActions = obtenerPermisosBotones(transferenciaRecursos!.botones!)   
  }

  getPermisos(){    
    this.perfilAuth = this.authStore.usuarioAuth().codigoPerfil!
    this.permisosPCM = this.getPermisosPCM()
  }

  getPermisosPCM(){
    // const profilePCM = [11,12,23]
    const ssfgdPCM = [11]
    this.esAdmin = ssfgdPCM.includes(this.perfilAuth)

    const permisosStorage = localStorage.getItem('permisosPcm') ?? ''
    return JSON.parse(permisosStorage) ?? false
  }

  getParams() {
      this.route.queryParams
        .pipe(
          filter(params => Object.keys(params).length > 0),
          distinctUntilChanged((prev,curr) => JSON.stringify(prev) === JSON.stringify(curr))
        )
        .subscribe( params => {
          this.loading = true
          const tipoUbigeo = params['tipoUbigeo'] ?? ''
          let campo = params['campo'] ?? 'entidadId'
          this.pagination.columnSort = campo
          this.pagination.currentPage = params['pagina']
          this.pagination.pageSize = params['cantidad']
          this.pagination.typeSort = params['ordenar'] ?? 'ASC'
          
          setParamsToObject(params, this.pagination, 'entidad')
          setParamsToObject(params, this.pagination, 'ubigeo')          
          setParamsToObject(params, this.pagination, 'tipoEntidad')     
          setParamsToObject(params, this.pagination, 'tipoUbigeo') 
          this.obtenerEntidadesService(tipoUbigeo)
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

  obtenerAutoridadJne(entidad: EntidadResponse){
    let ubigeo = entidad.ubigeo_jne
    const regionUbigeo = ubigeo.slice(0,2)
    const provUbigeo = ubigeo.slice(0,4)

    let tipo = JneAutoridadTipoEnum.DISTRITO
    if(entidad.subTipo == 'P'){
      tipo = JneAutoridadTipoEnum.PROVINCIA
      ubigeo = `${provUbigeo}00`
    }
    if(entidad.subTipo == 'R'){
      tipo = JneAutoridadTipoEnum.REGION
      ubigeo = `${regionUbigeo}0000`
    }   

    const paramsJne:JneAutoridadParams = { tipo, ubigeo }
    const paginationAsistente:Pagination = { columnSort: 'asistenteId', typeSort: 'ASC', pageSize: 1, currentPage: 1 }
    this.loadingAutoridad = true
    this.jneService.obtenerAutoridades(paramsJne)
      .pipe(
        switchMap( autoridadJneResp => 
          forkJoin({
            autoridadJneDniResp: this.jneService.obtenerAutoridadPorDni(obtenerAutoridadJne(autoridadJneResp.data).documentoIdentidad),
            asistenteResp: this.asistenteService.ListarAsistentes({ ...paginationAsistente, dni: obtenerAutoridadJne(autoridadJneResp.data).documentoIdentidad })
          })
          .pipe(
            tap(({ autoridadJneDniResp, asistenteResp }) => {
              const autoridadJne = obtenerAutoridadJne(autoridadJneResp.data)
              const autoridadDni = autoridadJneDniResp.data
              const asistente = asistenteResp.data[0]

              let sexo = '';
              if(autoridadDni.sexo){
                sexo = autoridadDni.sexo == "1" ? "M" : "F"
              }

              const entidadId = entidad.entidadId!
              const autoridad:AutoridadResponse = {
                entidadId,
                cargo: autoridadDni.cargo,
                foto: autoridadDni.rutaFoto,
                partidoPolitico: autoridadDni.organizacionPolitica,
                vigente: true,
                dni: autoridadDni.documentoIdentidad,
                nombres: autoridadDni.nombres,
                apellidos: `${autoridadDni.apellidoPaterno} ${autoridadDni.apellidoMaterno}`,
                sexo
              }

              const asistenteBody: AsistenteResponse = {
                dni: autoridadJne.documentoIdentidad,
                nombres: autoridadJne.nombres,
                apellidos: `${autoridadJne.apellidoPaterno} ${autoridadJne.apellidoMaterno}`,
                telefono: '',
                email: '',
                sexo
              }

              if(asistente){                
                this.asistenteService.actualizarAsistente({...asistenteBody, asistenteId: asistente.asistenteId})
                  .subscribe( resp => {});

                const paginationAutoridad: Pagination = {
                  entidadId: Number(entidadId),
                  asistenteId: asistente.asistenteId!,
                  columnSort: 'autoridadId',
                  typeSort: 'ASC',
                  currentPage: 1,
                  pageSize: 1
                }
                this.autoridadService.listarAutoridad(paginationAutoridad)
                  .subscribe( resp => {
                    if(resp.data.length > 0){
                      const autoridadSelected = resp.data.find( item => item.vigente == true)
                      this.autoridadService.actualizarAutoridad({...autoridad, autoridadId: autoridadSelected?.autoridadId})
                        .subscribe( resp => {})
                    } else {
                      this.autoridadService.registarAutoridad({...autoridad, asistenteId: asistente.asistenteId})
                        .subscribe(resp => {})
                    }
                  })
              } else {
                this.asistenteService.registarAsistente(asistenteBody)
                  .subscribe( resp => {
                    if(resp.success == true){
                      const asistentResp = resp.data
                      this.autoridadService.registarAutoridad({...autoridad, asistenteId: asistentResp.asistenteId})
                        .subscribe(resp => {})
                    }
                  })
              }
              setTimeout(() => {
                this.loadingAutoridad = false
                this.obtenerEntidadesService('')
              }, 200);
            })
          )
        ),
        catchError(err => {
          return of({ error: 'ERROR EN LA CONSULTA JNE' })
        })
      )
      .subscribe({
        error: err => console.error(err)
      })
  }
}
