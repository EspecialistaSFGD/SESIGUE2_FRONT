import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { getDateFormat, obtenerPermisosBotones, setParamsToObject } from '@core/helpers';
import { ActividadResponse, AdjuntoResponse, ButtonsActions, DesarrolloActividadResponse, Pagination } from '@core/interfaces';
import { ActividadesService, AdjuntosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { BotonComponent } from '@shared/boton/boton/boton.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { MessageService } from 'primeng/api';
import { distinctUntilChanged, filter } from 'rxjs';
import { FormularioDesarrolloActividadComponent } from './desarrollos-actividad/formulario-desarrollo-actividad/formulario-desarrollo-actividad.component';
import { FormularioActividadComponent } from './formulario-actividad/formulario-actividad.component';
import { UtilesService } from '@libs/shared/services/utiles.service';
import saveAs from 'file-saver';
import { AuthService } from '@libs/services/auth/auth.service';

@Component({
  selector: 'app-actividades',
  standalone: true,
  imports: [CommonModule, PrimeNgModule, NgZorroModule, PageHeaderComponent, BotonComponent],
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

  ngOnInit(): void {
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
    this.loading = true;
    this.pagination.usuarioId = localStorage.getItem('codigoUsuario') ?? ''
    this.actividadesService.listarActividades(this.pagination)
    .subscribe(resp => {
      this.loading = false;
      this.actividades.set(resp.data);
      this.pagination.total = resp.info?.total;
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

  reporteActividad(){
    this.loadingExport = true;
    this.actividadesService.reporteActividades(this.pagination)
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

  crearActividad(){
    this.actividadFormModal(true)
  }

  actividadFormModal(create: boolean): void{
      const action = `${create ? 'Crear' : 'Actualizar' } actividad`
      this.modal.create<FormularioActividadComponent>({
        nzTitle: `${action.toUpperCase()}`,
        nzWidth: '50%',
        nzMaskClosable: false,
        nzContent: FormularioActividadComponent,
        nzData: {
          create,
          actividad: this.actividad
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
              const actividadBody: ActividadResponse = { ...formActividad.value, horaInicio, horaFin, usuarioId, entidadSectorId }

              if(create){
                this.guardarActividadService(actividadBody)
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
