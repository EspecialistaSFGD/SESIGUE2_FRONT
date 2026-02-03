import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { deleteKeysToObject, obtenerAutoridadJnePorCargo, obtenerParamsAutoridadJne, obtenerPermisosBotones, setParamsToObject } from '@core/helpers';
import { AsistenteResponse, AutoridadResponse, ButtonsActions, EntidadResponse, JneAutoridadResponse, Pagination } from '@core/interfaces';
import { AsistentesService, AutoridadesService, EntidadesService, JneService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { AuthService } from '@libs/services/auth/auth.service';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { BotonComponent } from '@shared/boton/boton/boton.component';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { MessageService } from 'primeng/api';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import { FiltroEntidadComponent } from './filtro-entidad/filtro-entidad.component';

@Component({
  selector: 'app-entidades',
  standalone: true,
  imports: [CommonModule, RouterModule, PrimeNgModule, NgZorroModule, PageHeaderComponent, FiltroEntidadComponent, BotonComponent],
  providers: [MessageService],
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
  private messageService = inject(MessageService)

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
    const entidadesNav = navigation.find(nav => nav.codigo.toLowerCase() == 'entidades')
    this.entidadesActions = entidadesNav!.botones ? obtenerPermisosBotones(entidadesNav!.botones) : {}
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
    const tipoUbigeo = obtenerParamsAutoridadJne(entidad)
    this.jneService.obtenerAutoridades(tipoUbigeo)
      .subscribe( resp => {
        const autoridadJne = obtenerAutoridadJnePorCargo(resp.data)
        this.obtenerAutoridadPorDniService(entidad, autoridadJne)
      })
  }

  obtenerAutoridadPorDniService(entidad: EntidadResponse, autoridadJne: JneAutoridadResponse){
    const paginationAsistente:Pagination = { dni: autoridadJne.documentoIdentidad, columnSort: 'asistenteId', typeSort: 'ASC', pageSize: 1, currentPage: 1 }
    this.jneService.obtenerAutoridadPorDni(autoridadJne.documentoIdentidad)
      .pipe(
        switchMap(autoridadJneResp => 
          this.asistenteService.ListarAsistentes(paginationAsistente).pipe(
            map(asistenteResp => ({ autoridadJneResp, asistenteResp }) )
          )
        )
      )
      .subscribe(({ autoridadJneResp, asistenteResp }) => {
        const autoridadJneDni = autoridadJneResp.data
        const asistente = asistenteResp.data[0]

        if(asistente){
          this.verificarAutoridadService(entidad, autoridadJneDni, asistente)
        } else {
          const asistenteResp = {
            dni: autoridadJneDni.documentoIdentidad,
            nombres: autoridadJneDni.nombres,
            apellidos: `${autoridadJneDni.apellidoPaterno} ${autoridadJneDni.apellidoPaterno}`,
            sexo: autoridadJneDni.sexo
          }
          const autoridadResp: AutoridadResponse = {
            ...asistenteResp,
            entidadId: `${entidad.entidadId}`,
            asistenteId: '',
            cargo: autoridadJneDni.cargo,
            foto: autoridadJneDni.rutaFoto,
            partidoPolitico: autoridadJneDni.organizacionPolitica,
            vigente: true
          }

          this.crearAsistenteService(autoridadResp, asistenteResp)
        }
      })
  }

  verificarAutoridadService(entidad: EntidadResponse, autoridad: JneAutoridadResponse, asistente: AsistenteResponse){
    const autoridadParams: Pagination = {
      entidadId: Number(entidad.entidadId),
      asistenteId: asistente.asistenteId,
      columnSort: 'autoridadId',
      typeSort: 'ASC',
      pageSize: 10,
      currentPage: 1
    }

    this.autoridadService.listarAutoridad(autoridadParams)
      .subscribe( resp => {
        const autoridadResp: AutoridadResponse = {
          ...resp.data[0],
          cargo: autoridad.cargo,
          foto: autoridad.rutaFoto,
          partidoPolitico: autoridad.organizacionPolitica,
          vigente: true
        }

        const asistenteResp = {
          ...asistente,
          nombres: autoridad.nombres,
          apellidos: `${autoridad.apellidoPaterno} ${autoridad.apellidoPaterno}`,
          sexo: autoridad.sexo
        }
        if(resp.data.length > 0){
          this.actualizarAsistenteService(asistenteResp)
          this.actualizarAutoridadService(autoridadResp)
        }
      })
  }

  actualizarAsistenteService(asistente: AsistenteResponse){
    this.asistenteService.actualizarAsistente(asistente)
      .subscribe( resp => {})
  }

  actualizarAutoridadService(autoridad: AutoridadResponse){
    this.autoridadService.actualizarAutoridad(autoridad)
      .subscribe( resp => {
        if(resp.success){
          this.messageService.add({ severity: 'success', summary: 'Autoridad Actualizada', detail: resp.message });
          this.obtenerEntidadesService('')
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: resp.message });
        }
      })
  }

  crearAsistenteService(autoridad: AutoridadResponse, asistente: AsistenteResponse){
    this.asistenteService.registarAsistente(asistente)
      .subscribe( resp => {
        if(resp.success){
          const asistenteResp = resp.data
          autoridad.asistenteId = asistenteResp.asistenteId
          this.crearAutoridadService(autoridad)
        }
      })
  }

  crearAutoridadService(autoridad: AutoridadResponse){
    this.autoridadService.registarAutoridad(autoridad)
      .subscribe( resp => {
        if(resp.success){
          this.messageService.add({ severity: 'success', summary: 'Autoridad registrada', detail: resp.message });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: resp.message });
        }
      })
  }


  // obtenerAutoridadJne(entidad: EntidadResponse){
  //   let ubigeo = entidad.ubigeo_jne
  //   const regionUbigeo = ubigeo.slice(0,2)
  //   const provUbigeo = ubigeo.slice(0,4)

  //   let tipo = JneAutoridadTipoEnum.DISTRITO
  //   if(entidad.subTipo == 'P'){
  //     tipo = JneAutoridadTipoEnum.PROVINCIA
  //     ubigeo = `${provUbigeo}00`
  //   }
  //   if(entidad.subTipo == 'R'){
  //     tipo = JneAutoridadTipoEnum.REGION
  //     ubigeo = `${regionUbigeo}0000`
  //   }   

  //   const paramsJne:JneAutoridadParams = { tipo, ubigeo }
  //   const paginationAsistente:Pagination = { columnSort: 'asistenteId', typeSort: 'ASC', pageSize: 1, currentPage: 1 }
  //   this.loadingAutoridad = true
  //   this.jneService.obtenerAutoridades(paramsJne)
  //     .pipe(
  //       switchMap( autoridadJneResp => 
  //         forkJoin({
  //           autoridadJneDniResp: this.jneService.obtenerAutoridadPorDni(obtenerAutoridadJne(autoridadJneResp.data).documentoIdentidad),
  //           asistenteResp: this.asistenteService.ListarAsistentes({ ...paginationAsistente, dni: obtenerAutoridadJne(autoridadJneResp.data).documentoIdentidad })
  //         })
  //         .pipe(
  //           tap(({ autoridadJneDniResp, asistenteResp }) => {
  //             const autoridadJne = obtenerAutoridadJne(autoridadJneResp.data)
  //             const autoridadDni = autoridadJneDniResp.data
  //             const asistente = asistenteResp.data[0]

  //             let sexo = '';
  //             if(autoridadDni.sexo){
  //               sexo = autoridadDni.sexo == "1" ? "M" : "F"
  //             }

  //             const entidadId = entidad.entidadId!
  //             const autoridad:AutoridadResponse = {
  //               entidadId,
  //               asistenteId: `${asistente.asistenteId}`,
  //               cargo: autoridadDni.cargo,
  //               foto: autoridadDni.rutaFoto,
  //               partidoPolitico: autoridadDni.organizacionPolitica,
  //               vigente: true,
  //               dni: autoridadDni.documentoIdentidad,
  //               nombres: autoridadDni.nombres,
  //               apellidos: `${autoridadDni.apellidoPaterno} ${autoridadDni.apellidoMaterno}`,
  //               sexo
  //             }

  //             const asistenteBody: AsistenteResponse = {
  //               dni: autoridadJne.documentoIdentidad,
  //               nombres: autoridadJne.nombres,
  //               apellidos: `${autoridadJne.apellidoPaterno} ${autoridadJne.apellidoMaterno}`,
  //               telefono: '',
  //               email: '',
  //               sexo
  //             }

  //             if(asistente){                
  //               this.asistenteService.actualizarAsistente({...asistenteBody, asistenteId: asistente.asistenteId})
  //                 .subscribe( resp => {});

  //               const paginationAutoridad: Pagination = {
  //                 entidadId: Number(entidadId),
  //                 asistenteId: asistente.asistenteId!,
  //                 columnSort: 'autoridadId',
  //                 typeSort: 'ASC',
  //                 currentPage: 1,
  //                 pageSize: 1
  //               }
  //               this.autoridadService.listarAutoridad(paginationAutoridad)
  //                 .subscribe( resp => {
  //                   if(resp.data.length > 0){
  //                     const autoridadSelected = resp.data.find( item => item.vigente == true)
  //                     this.autoridadService.actualizarAutoridad({...autoridad, autoridadId: autoridadSelected?.autoridadId})
  //                       .subscribe( resp => {})
  //                   } else {
  //                     this.autoridadService.registarAutoridad({...autoridad })
  //                       .subscribe(resp => {})
  //                   }
  //                 })
  //             } else {
  //               this.asistenteService.registarAsistente(asistenteBody)
  //                 .subscribe( resp => {
  //                   if(resp.success == true){
  //                     const asistentResp = resp.data
  //                     this.autoridadService.registarAutoridad({...autoridad, asistenteId: asistentResp.asistenteId})
  //                       .subscribe(resp => {})
  //                   }
  //                 })
  //             }
  //             setTimeout(() => {
  //               this.loadingAutoridad = false
  //               this.obtenerEntidadesService('')
  //             }, 200);
  //           })
  //         )
  //       ),
  //       catchError(err => {
  //         return of({ error: 'ERROR EN LA CONSULTA JNE' })
  //       })
  //     )
  //     .subscribe({
  //       error: err => console.error(err)
  //     })
  // }
}
