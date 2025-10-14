import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { deleteKeysToObject, obtenerPermisosBotones, setParamsToObject } from '@core/helpers';
import { ButtonsActions, IntervencionEspacioResponse, MesaResponse, Pagination, UsuarioNavigation } from '@core/interfaces';
import { PipesModule } from '@core/pipes/pipes.module';
import { IntervencionEspacioService, MesaIntegrantesService, MesasService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { AuthService } from '@libs/services/auth/auth.service';
import { UtilesService } from '@libs/shared/services/utiles.service';
import { BotonComponent } from '@shared/boton/boton/boton.component';
import { FormularioComentarComponent } from '@shared/formulario-comentar/formulario-comentar.component';
import { SharedModule } from '@shared/shared.module';
import saveAs from 'file-saver';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { FormularioIntervencionComponent } from '../../intervenciones/formulario-intervencion/formulario-intervencion.component';
import { MesaDetalleComponent } from '../mesa-detalles/mesa-detalle/mesa-detalle.component';
import { FiltroIntervencionesComponent } from '../../intervenciones/filtro-intervenciones/filtro-intervenciones.component';
import { distinctUntilChanged, filter } from 'rxjs';

@Component({
  selector: 'app-agendas-mesa',
  standalone: true,
  imports: [CommonModule, RouterModule, NgZorroModule, SharedModule, PipesModule, MesaDetalleComponent, BotonComponent, FiltroIntervencionesComponent],
  templateUrl: './agendas-mesa.component.html',
  styles: ``
})
export default class AgendasMesaComponent {
  title: string = `Agenda de la mesa`;

  authUserId = localStorage.getItem('codigoUsuario')
  mesaId!: number
  loading: boolean = false
  sectores:number[] = []
  ubigeos:string[] = []
  loadingExport: boolean = false
  openFilters: boolean = false

  mesasAgendaActions: ButtonsActions = {}
  mesasActions: ButtonsActions = {}
  permisosPCM: boolean = false
  perfilAuth: number = 0
  sectorAuth: number = 0

  fechaSincronizacion: string = ''

  mesa = signal<MesaResponse>({
    nombre: '',
    abreviatura: '',
    sectorId: '',
    secretariaTecnicaId: '',
    fechaCreacion: '',
    fechaVigencia: '',
    resolucion: '',
    estadoRegistroNombre: '',
    estadoRegistro: '',
    usuarioId: this.authUserId!
  })

  intervencionesEspacios = signal<IntervencionEspacioResponse[]>([])

  pagination: Pagination = {
    columnSort: 'fechaRegistro',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1
  }

  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private mesaServices = inject(MesasService)
  private mesaIntegranteServices = inject(MesaIntegrantesService)
  private intervencionEspaciosServices = inject(IntervencionEspacioService)
  private modal = inject(NzModalService);
  private utilesService = inject(UtilesService);
  private authStore = inject(AuthService)

  ngOnInit(): void {
    this.perfilAuth = this.authStore.usuarioAuth().codigoPerfil!
    this.sectorAuth = Number(this.authStore.usuarioAuth().sector!.value) ?? 0

    this.permisosPCM = this.setPermisosPCM()
    this.getPermissions()
    this.verificarMesa()
    this.pagination.origenId = '1'
    this.pagination.interaccionId = `${this.mesaId}`
    this.getParams()
  }

  getParams() {
    // this.route.queryParams.subscribe(params => {
      // this.loading = true
    //   if (Object.keys(params).length > 0) {        
    //     let campo = params['campo'] ?? 'intervencionEspacioId'

    //     this.pagination.columnSort = campo
    //     this.pagination.currentPage = params['pagina']
    //     this.pagination.pageSize = params['cantidad']
    //     this.pagination.typeSort = params['ordenar'] ?? 'DESC'
  
    //     // setParamsToObject(params, this.pagination, 'codigo')
    //     // setParamsToObject(params, this.pagination, 'nombre')
    //     // setParamsToObject(params, this.pagination, 'sectorId')
    //     // setParamsToObject(params, this.pagination, 'secretariaTecnicaId')
    //     // setParamsToObject(params, this.pagination, 'sectorEntidadId')
    //     // setParamsToObject(params, this.pagination, 'entidadId')
    //     // setParamsToObject(params, this.pagination, 'ubigeo')
    //     // setParamsToObject(params, this.pagination, 'entidadUbigeoId')

    //     setTimeout(() => {
    //       this.obtenerMesaIntegrantesService(true)
    //       this.obtenerMesaIntegrantesService(false)
    //       this.obtenerIntervencionEspacioService()
    //     }, 100)
    //   }
    // })


    this.route.queryParams
      .pipe(
        filter(params => Object.keys(params).length > 0),
        distinctUntilChanged((prev,curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe( params => {
        let campo = params['campo'] ?? 'intervencionEspacioId'

        this.pagination.columnSort = campo
        this.pagination.currentPage = params['pagina']
        this.pagination.pageSize = params['cantidad']
        this.pagination.typeSort = params['ordenar'] ?? 'DESC'

        setParamsToObject(params, this.pagination, 'cui')
        setParamsToObject(params, this.pagination, 'ubigeo')
        setParamsToObject(params, this.pagination, 'entidadUbigeoId')

        this.obtenerIntervencionEspacioService()
      })
  }
    
    setPermisosPCM(){
      // const profilePCM = [11,12,23]
      const permisosStorage = localStorage.getItem('permisosPcm') ?? ''
      return JSON.parse(permisosStorage) ?? false
    }

    onBack(){
      this.router.navigate(['/mesas/', this.mesa().mesaId])
    }
  
    getPermissions() {
      const navigation:UsuarioNavigation[] = JSON.parse(localStorage.getItem('menus') || '')
      const menu = navigation.find((nav) => nav.descripcionItem.toLowerCase() == 'mesas')
      this.mesasActions = obtenerPermisosBotones(menu!.botones!)
      const navLevel =  menu!.children!

      const mesaAgendaNav = navLevel.find(nav => nav.descripcionItem?.toLowerCase() == 'mesa agenda')
      this.mesasAgendaActions = obtenerPermisosBotones(mesaAgendaNav!.botones!)
    }

  verificarMesa(){
    const mesaId = this.route.snapshot.params['id'];
    const mesaIdNumber = Number(mesaId);
    if (isNaN(mesaIdNumber)) {
      this.router.navigate(['/mesas']);
      return;
    }

    this.mesaId = mesaIdNumber    
    this.mesaServices.obtenerMesa(mesaId)
      .subscribe( resp => {
        if(resp.success){
          this.mesa.set(resp.data)
        } else {
          this.router.navigate(['/mesas']);
        }
      })
  }

  generateFilters(pagination: Pagination){
    const paramsInvalid: string[] = ['pageIndex','pageSize','columnSort','code','typeSort','currentPage','total', 'departamento', 'provincia', 'distrito']
    const params = deleteKeysToObject(pagination, paramsInvalid)
    this.paramsNavigate(params)
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const sortsNames = ['ascend', 'descend']
    const sorts = params.sort.find(item => sortsNames.includes(item.value!))
    const qtySorts = params.sort.reduce((total, item) => {
      return sortsNames.includes(item.value!) ? total + 1 : total
    }, 0)
    const campo = sorts?.key
    const ordenar = sorts?.value!.slice(0, -3)
    const filtrosMesas = localStorage.getItem('filtrosMesaIntervenciones');
    let filtros:any = {}
    if(filtrosMesas){
      filtros = JSON.parse(filtrosMesas)
      filtros.save = false      
      localStorage.setItem('filtrosMesaIntervenciones', JSON.stringify(filtros))
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

  obtenerMesaIntegrantesService(sector: boolean){
    const esSector = sector ? '1' : '0'
    this.mesaIntegranteServices.ListarMesaIntegrantes(this.mesaId.toString(), {...this.pagination, columnSort: 'mesaIntegranteId', pageSize: 100, esSector})
      .subscribe( resp => {
        sector
        ? this.sectores = Array.from(new Set(resp.data.map( item => Number(item.sectorId))))
        : this.ubigeos = Array.from(new Set(resp.data.map( item => item.ubigeo!.slice(0,2))))
      })
  }

  obtenerIntervencionEspacioService(){
    this.loading = true
    const pagination: Pagination = { ...this.pagination }
    if(!this.permisosPCM){
      pagination.sectorId = this.sectorAuth
    }

    this.intervencionEspaciosServices.ListarIntervencionEspacios(pagination)
      .subscribe( resp => {           
        this.loading = false
        this.intervencionesEspacios.set(resp.data)
        this.pagination.total = resp.info?.total
      })
  }

  intervencionDetalle(intervencionEspacioId: string){
    this.router.navigate(['intervenciones', intervencionEspacioId], {
      queryParams: {
        modelo: 'mesas',
        modeloId: this.mesa().mesaId
      }
    });
  }

  procesarIntervencion(){
    const pagination:Pagination = { origenId: '1', interaccionId: this.mesaId.toString() }
    this.intervencionEspaciosServices.procesarIntervencionEspacio(pagination)
      .subscribe( resp => {
        this.fechaSincronizacion = resp.data.fecha
        this.obtenerIntervencionEspacioService()
      })
  }

  comentarIntervencion(intervencionEspacio: IntervencionEspacioResponse){
    this.modal.create<FormularioComentarComponent>({
      nzTitle: `AGREGAR RESUMEN`,
      nzContent: FormularioComentarComponent,
      nzData: {},
      nzFooter: [
        {
          label: 'Cancelar',
          type: 'default',
          onClick: () => this.modal.closeAll(),
        },
        {
          label: 'Agregar',
          type: 'primary',
          onClick: (componentResponse) => {
            const formComentario = componentResponse!.formComentario
            if (formComentario.invalid) {
              const invalidFields = Object.keys(formComentario.controls).filter(field => formComentario.controls[field].invalid);
              console.error('Invalid fields:', invalidFields);
              return formComentario.markAllAsTouched();
            }
            const comentario = formComentario.get('comentario')?.value;
            const usuarioId = localStorage.getItem('codigoUsuario')!
            intervencionEspacio.resumen = comentario
            intervencionEspacio.usuarioId = usuarioId

            this.actualizarIntervencionEspacio(intervencionEspacio)
          }
        }
      ]
    })
  }

  actualizarIntervencionEspacio(intervencionEspacio: IntervencionEspacioResponse){
    this.intervencionEspaciosServices.actualizarIntervencionEspacio(intervencionEspacio)
      .subscribe( resp => {
        if(resp.success){
          this.obtenerIntervencionEspacioService()
          this.modal.closeAll()
        }
      })
  }

  estadoEliminarIntervencionEspacio(intervencionEspacio: IntervencionEspacioResponse): boolean {
    return intervencionEspacio.cantidadTareas != 0
  }

  eliminarIntervencion(intervencionEspacio: IntervencionEspacioResponse){
    this.modal.confirm({
      nzTitle: `Eliminar intervención`,
      nzContent: `¿Está seguro de que desea eliminar ${intervencionEspacio.tipo?.toUpperCase()} ${intervencionEspacio.codigoIntervencion}?`,
      nzOkText: 'Eliminar',
      nzOkDanger: true,
      nzOnOk: () => {
        this.intervencionEspaciosServices.eliminarIntervencionEspacio(intervencionEspacio.intervencionEspacioId!)
      .subscribe( resp => {
        if(resp.success){
          this.obtenerIntervencionEspacioService()
        }
      })
      },
      nzCancelText: 'Cancelar'
    });
    
  }

  reporteIntervencion(){
    this.loadingExport = true;
    this.intervencionEspaciosServices.reporteIntervencionEspacios(this.pagination)
      .subscribe( resp => {
        if(resp.data){
          const data = resp.data;
          this.generarExcel(data.archivo, data.nombreArchivo);
        }
        this.loadingExport = false
      })
  }

  generarExcel(archivo: any, nombreArchivo: string): void {
    const arrayBuffer = this.utilesService.base64ToArrayBuffer(archivo);
    const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, nombreArchivo);
  }

  crearIntervencion(){
    this.obtenerMesaIntegrantesService(true)
    this.obtenerMesaIntegrantesService(false)

    // setTimeout(() => {
    //       this.obtenerMesaIntegrantesService(true)
    //       this.obtenerMesaIntegrantesService(false)
    //     }, 100)

    const intervencionEspacio: IntervencionEspacioResponse = {} as IntervencionEspacioResponse
    intervencionEspacio.origen = '1'
    intervencionEspacio.interaccionId = this.mesaId.toString()
    intervencionEspacio.eventoId = this.mesa().eventoId!.toString()
    intervencionEspacio.tipoEventoId = this.mesa().tipoEventoId

    setTimeout(() => this.intervencionEspacioForm(intervencionEspacio), 200);    
  }

  intervencionEspacioForm(intervencionEspacio: IntervencionEspacioResponse, create: boolean = true){
    const action = `${create ? 'Crear' : 'Actualizar' } Intervencion`
    this.modal.create<FormularioIntervencionComponent>({
      nzTitle: `${action.toUpperCase()}`,
      nzWidth: '50%',
      nzMaskClosable: false,
      nzContent: FormularioIntervencionComponent,
      nzData: {
        create,
        intervencionEspacio,
        sectores: this.sectores,
        ubigeos: this.ubigeos
      },
      nzFooter: [
        {
          label: 'Cancelar',
          type: 'default',
          onClick: () => this.modal.closeAll(),
        },
        {
          label: action,
          type: 'primary',
          onClick: (componentResponse) => {
            const formIntervencionEspacio = componentResponse!.formIntervencionEspacio

            if (formIntervencionEspacio.invalid) {
              const invalidFields = Object.keys(formIntervencionEspacio.controls).filter(field => formIntervencionEspacio.controls[field].invalid);
              console.error('Invalid fields:', invalidFields);
              return formIntervencionEspacio.markAllAsTouched();
            }
               
            const origen = 'mesas'
            const bodyIntervencionEspacio: IntervencionEspacioResponse = {...formIntervencionEspacio.getRawValue(), origen }
            const usuarioId = localStorage.getItem('codigoUsuario')!
            bodyIntervencionEspacio.usuarioIdRegistro = usuarioId

            if(create){
              this.registrarIntervencionEspacio(bodyIntervencionEspacio)
            }
          }
        }
      ]
    })
  }

  registrarIntervencionEspacio(intervencionEspacio: IntervencionEspacioResponse) {
    this.intervencionEspaciosServices.registrarIntervencionEspacio(intervencionEspacio)
      .subscribe(resp => {
        if (resp.success) {
          this.obtenerIntervencionEspacioService()
          this.modal.closeAll()
        }
      });
  }
}
