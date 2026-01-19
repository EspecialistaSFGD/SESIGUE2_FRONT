import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { deleteKeysToObject, getDateFormat, obtenerPermisosBotones, setParamsToObject } from '@core/helpers';
import { ActividadResponse, AdjuntoResponse, ButtonsActions, DesarrolloActividadResponse, Pagination } from '@core/interfaces';
import { ActividadesService, AdjuntosService, EventosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { AuthService } from '@libs/services/auth/auth.service';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { UtilesService } from '@libs/shared/services/utiles.service';
import { BotonDescargarComponent } from '@shared/boton/boton-descargar/boton-descargar.component';
import { BotonComponent } from '@shared/boton/boton/boton.component';
import saveAs from 'file-saver';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { MessageService } from 'primeng/api';
import { distinctUntilChanged, filter } from 'rxjs';
import { FormularioDesarrolloActividadComponent } from './desarrollos-actividad/formulario-desarrollo-actividad/formulario-desarrollo-actividad.component';
import { FiltroActividadesComponent } from './filtro-actividades/filtro-actividades.component';
import { FormularioActividadComponent } from './formulario-actividad/formulario-actividad.component';

@Component({
  selector: 'app-actividades',
  standalone: true,
  imports: [CommonModule, PrimeNgModule, NgZorroModule, PageHeaderComponent, BotonComponent, BotonDescargarComponent, FiltroActividadesComponent],
  providers: [MessageService],
  templateUrl: './actividades.component.html',
  styles: ``
})
export class ActividadesComponent {
  actividades = signal<ActividadResponse[]>([]);
  actividad = signal<ActividadResponse>({} as ActividadResponse);

  loadingExport: boolean = false;
  loading: boolean = false;
  openFilters: boolean = false;
  nuevoActivo: boolean = false

  actividadesActions: ButtonsActions = {}
  perfilAuth: number = 0
  permisosPCM: boolean = false

  pagination: Pagination = {
    columnSort: 'actividadId',
    typeSort: 'DESC',
    currentPage: 1,
    pageSize: 10,
    total: 0
  };

  private actividadesService = inject(ActividadesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute)
  private modal = inject(NzModalService)
  private messageService = inject(MessageService)
  private adjuntoService = inject(AdjuntosService)
  private utilesService = inject(UtilesService)
  private authStore = inject(AuthService)
  private eventosService = inject(EventosService)
  private breakpoint = inject(BreakpointObserver)

  ngOnInit(): void {
    this.obtenerEventosService()
    this.getPermissions()
    this.getParams()
  }

  getPermissions() {
    const navigation = this.authStore.navigationAuth()!
    const actividadesNav = navigation.find(nav => nav.descripcionItem.toLowerCase() == 'actividades')
    this.actividadesActions = actividadesNav && actividadesNav.botones ? obtenerPermisosBotones(actividadesNav!.botones!) : {}

    this.perfilAuth = this.authStore.usuarioAuth().codigoPerfil!
    this.permisosPCM = this.setPermisosPCM()
  }

  setPermisosPCM(){
    const permisosStorage = localStorage.getItem('permisosPcm') ?? ''
    return JSON.parse(permisosStorage) ?? false
  }

  obtenerEventosService(){
    const paginationEvento: Pagination = { estados: ['1','2'], columnSort: 'eventoId', typeSort: 'DESC', pageSize: 25, currentPage: 1 }
    this.eventosService.ListarEventos(paginationEvento)
      .subscribe( resp => {
        this.nuevoActivo = resp.data.length > 0
    })
  }

  getParams() {
    this.route.queryParams
      .pipe(
        filter(params => Object.keys(params).length > 0),
        distinctUntilChanged((prev,curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe( params => {   
        let campo = params['campo'] ?? 'actividadId'

        this.pagination.columnSort = campo
        this.pagination.currentPage = params['pagina']
        this.pagination.pageSize = params['cantidad']
        this.pagination.typeSort = params['ordenar'] ?? 'DESC'

        setParamsToObject(params, this.pagination, 'tipoEspacioId')        
        setParamsToObject(params, this.pagination, 'espacioId')        
        setParamsToObject(params, this.pagination, 'sectorId')
        this.obtenerActividadesService()
    })
  }

  obtenerActividadesService(){
    this.loading = true;
    this.pagination.usuarioId = localStorage.getItem('codigoUsuario') ?? ''
    // this.authStore.usuarioAuth().sector ? this.pagination.sectorId = Number(this.authStore.usuarioAuth().sector!.value) : delete this.pagination.sectorId
    if(!this.permisosPCM){
      this.pagination.sectorId = Number(this.authStore.usuarioAuth().sector!.value)
    }
    this.actividadesService.listarActividades(this.pagination)
    .subscribe(resp => {
      this.loading = false;
      this.actividades.set(resp.data);
      this.pagination.total = resp.info?.total;
    })
  }

  permisosVigenteActividad(actividad: ActividadResponse): boolean{
    const vigentesActividad:string[] = ['pendiente','iniciado']
    return vigentesActividad.includes(actividad.vigente!.toLowerCase())
  }

  permisosVigenteDesarrollo(actividad: ActividadResponse): boolean{
    const vigentesActividad:string[] = ['iniciado','seguimiento']
    return vigentesActividad.includes(actividad.vigente!.toLowerCase())
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

  generateFilters(pagination: Pagination){
    const paramsInvalid: string[] = ['pageIndex','pageSize','columnSort','code','typeSort','currentPage','total']
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

  reporteActividad(){
    this.loadingExport = true;
    this.actividadesService.reporteActividades(this.pagination)
      .subscribe( resp => {
        if(!resp.success){
          this.messageService.add({severity:'info', summary: 'Info', detail: resp.message});
        }
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

  crearActividad(){
    this.actividad.set({} as ActividadResponse)
    this.actividadFormModal(true)
  }

  actualizarActividad(actividad: ActividadResponse){
    this.actividad.set(actividad)
    this.actividadFormModal(false)
  }

  actividadFormModal(create: boolean): void{
      const codigo = create ? '' : this.actividad().codigo
      const action = `${create ? 'Crear' : 'Actualizar' } actividad`

      const widthModal = (this.breakpoint.isMatched('(max-width: 767px)')) ? '90%' : '50%';
      this.modal.create<FormularioActividadComponent>({
        nzTitle: `${action.toUpperCase()} ${codigo}`,
        nzWidth: widthModal,
        nzMaskClosable: false,
        nzContent: FormularioActividadComponent,
        nzData: {
          create,
          actividad: this.actividad()
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
              const formActividad = componentResponse!.formActividad
           
              if (formActividad.invalid) {
                const invalidFields = Object.keys(formActividad.controls).filter(field => formActividad.controls[field].invalid);
                console.error('Invalid fields:', invalidFields);
                return formActividad.markAllAsTouched();
              }

              const horaInicioFecha = new Date(formActividad.get('horaInicio')?.value);
              const horaFinFecha = new Date(formActividad.get('horaFin')?.value);

              const fechaInicio = getDateFormat(horaInicioFecha, 'month');
              const fechaFin = getDateFormat(horaFinFecha, 'month');

              const horaInicio = `${fechaInicio} ${horaInicioFecha.getHours()}:${horaInicioFecha.getMinutes()}`
              const horaFin = `${fechaFin} ${horaFinFecha.getHours()}:${horaFinFecha.getMinutes()}`
             
              const usuarioId =localStorage.getItem('codigoUsuario')
              const entidadSectorId =localStorage.getItem('entidad')
              let actividadBody: ActividadResponse = { ...formActividad.value, horaInicio, horaFin, usuarioId, entidadSectorId }

              if(create){
                this.guardarActividadService(actividadBody)
              } else {
                actividadBody.actividadId = this.actividad().actividadId
                this.actualizarActividadService(actividadBody)
              }
            }
          },
        ],
      });
  }

  guardarActividadService(actividad: ActividadResponse){
    this.actividadesService.registrarActividad(actividad)
    .subscribe(resp => {
      if(resp.success === false){
        this.messageService.add({severity:'error', summary: 'Error', detail: resp.message});
        return;
      } else {
        this.messageService.add({severity:'success', summary: 'Success', detail: 'Actividad creada correctamente'});
        this.obtenerActividadesService()
        this.modal.closeAll()
      }
    })
  }

  actualizarActividadService(actividad: ActividadResponse){
    this.actividadesService.actualizarActividad(actividad)
    .subscribe(resp => {
      if(resp.success === false){
        this.messageService.add({severity:'error', summary: 'Error', detail: resp.message});
        return;
      } else {
        this.messageService.add({severity:'success', summary: 'Success', detail: 'Actividad actualizada correctamente'});
        this.obtenerActividadesService()
        this.modal.closeAll()
      }
    })
  }

  destacarPcm(actividad: ActividadResponse){
    const actividadBody: ActividadResponse = { ...actividad, destacadoPCM: true }
    this.modal.confirm({
      nzTitle: `¿Está seguro de destacar la actividad ${actividad.codigo}?`,
      nzContent: 'Esta acción no se puede deshacer.',
      nzOkText: 'Destacar',
      nzOkDanger: false,
      nzOnOk: () => this.actualizarActividadService(actividadBody),
      nzCancelText: 'Cancelar',
    });
  }

  eliminarActividad(actividad: ActividadResponse){
    this.modal.confirm({
      nzTitle: `¿Está seguro de eliminar la actividad ${actividad.codigo}?`,
      nzContent: 'Esta acción no se puede deshacer.',
      nzOkText: 'Eliminar',
      nzOkDanger: true,
      nzOnOk: () => this.eliminarActividadService(actividad),
      nzCancelText: 'Cancelar',
    });
  }

  eliminarActividadService(actividad: ActividadResponse){
    this.actividadesService.eliminarActividad(actividad.actividadId!)
        .subscribe(resp => {
          if(resp.success === false){
            this.messageService.add({severity:'error', summary: 'Error', detail: resp.message});
            return;
          } else {
            this.messageService.add({severity:'success', summary: 'Success', detail: 'Actividad eliminada correctamente'});
            this.obtenerActividadesService()
            this.modal.closeAll()
          }
        })
  }

  subirDesarrollo(actividad: ActividadResponse){
    this.modal.create<FormularioDesarrolloActividadComponent>({
      nzTitle: `Agregar Desarrollo`,
      nzMaskClosable: false,
      nzContent: FormularioDesarrolloActividadComponent,
      nzFooter: [
        {
          label: 'Cancelar',
          type: 'default',
          onClick: () => this.modal.closeAll(),
        },
        {
          label: 'Agregar desarrollo',
          type: 'primary',
          onClick: (componentResponse) => {
            const formDesarolloActividad = componentResponse!.formDesarolloActividad
          
            if (formDesarolloActividad.invalid) {
              const invalidFields = Object.keys(formDesarolloActividad.controls).filter(field => formDesarolloActividad.controls[field].invalid);
              console.error('Invalid fields:', invalidFields);
              return formDesarolloActividad.markAllAsTouched();
            }
            const usuarioId =localStorage.getItem('codigoUsuario')!
            const actividadId = actividad.actividadId

            const desarrolloBody: DesarrolloActividadResponse = { ...formDesarolloActividad.value, usuarioId, actividadId, destacadoPCM: false }
            this.guardarAdjuntoService(desarrolloBody)
            
            const actividadBody: ActividadResponse = { ...actividad, desarrollo: desarrolloBody.descripcion, usuarioId }
            this.actualizarActividadService(actividadBody)
          }
        }
      ]
    });
  }

  guardarAdjuntoService(desarrolloActividad: DesarrolloActividadResponse){
    for(let adjunto of desarrolloActividad.adjuntos){
      const adjuntoBody: AdjuntoResponse = {...adjunto, nombreTabla: 'actividad', tablaId: desarrolloActividad.actividadId!, usuarioId: desarrolloActividad.usuarioId!}
      this.adjuntoService.registrarAdjunto(adjuntoBody)
      .subscribe(resp => {
        // if(resp.success === false){
        //   this.messageService.add({severity:'error', summary: 'Error', detail: resp.message});
        //   return;
        // } else {
        //   this.messageService.add({severity:'success', summary: 'Success', detail: 'Adjunto registrado correctamente'});
        //   this.obtenerActividadesService()
        // }
      })
    }
  }
}
