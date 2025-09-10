import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { convertEnumToObject, deleteKeysToObject, obtenerPermisosBotones } from '@core/helpers';
import { AsistenciasTecnicasClasificacion, AsistenciasTecnicasModalidad, AsistenciasTecnicasTipos, AsistenciaTecnicaAgendaResponse, AsistenciaTecnicaCongresistaResponse, AsistenciaTecnicaParticipanteResponse, AsistenciaTecnicaResponse, ButtonsActions, CongresistaResponse, EventoResponse, ItemEnum, OrientacionAtencion, Pagination } from '@core/interfaces';
import { AsistenciasTecnicasService, AsistenciaTecnicaAgendasService, AsistenciaTecnicaCongresistasService, AsistenciaTecnicaParticipantesService, CongresistasService } from '@core/services';
import { EventosService } from '@core/services/eventos.service';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { AuthService } from '@libs/services/auth/auth.service';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { UtilesService } from '@libs/shared/services/utiles.service';
import saveAs from 'file-saver';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { FiltrosAtencionComponent } from './filtros-atencion/filtros-atencion.component';
import { FormularioAtencionComponent } from './formulario-atencion/formulario-atencion.component';

@Component({
  selector: 'app-asistencia-tecnica',
  standalone: true,
  templateUrl: './asistencias-tecnicas.component.html',
  styles: ``,
  imports: [
    CommonModule,
    PageHeaderComponent,
    NgZorroModule,
    RouterModule,
    FiltrosAtencionComponent,
    PrimeNgModule
  ]
})

export default class AsistenciasTecnicasComponent {
  public asistenciasTecnicas = signal<AsistenciaTecnicaResponse[]>([])
  public evento = signal<EventoResponse>({} as EventoResponse)

  pagination: Pagination = {
    code: 0,
    columnSort: 'asistenciaId',
    typeSort: 'ASC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }
  
  paginationFilter: Pagination = {}

  atencionActions: ButtonsActions = {}

  perfilAuth: number = 0
  sectorAuth: number = 0
  filtrosVisible: boolean = false
  loadingExport: boolean = false
  loading: boolean = false
  permisosPCM: boolean = false
  asistenciaTecnica!: AsistenciaTecnicaResponse
  create: boolean = true
  showNzModal: boolean = false

  confirmModal?: NzModalRef;
  tipos: ItemEnum[] = convertEnumToObject(AsistenciasTecnicasTipos)
  modalidades: ItemEnum[] = convertEnumToObject(AsistenciasTecnicasModalidad)
  clasificaciones: ItemEnum[] = convertEnumToObject(AsistenciasTecnicasClasificacion)
  public orientaciones: OrientacionAtencion[] = [
    { orientacionId: 1, nombre: 'Actividad' },
    { orientacionId: 2, nombre: 'Proyecto' },
    { orientacionId: 3, nombre: 'Idea' },
    { orientacionId: 4, nombre: 'Programa' }
  ]

  private modal = inject(NzModalService);
  private router = inject(Router);
  private route = inject(ActivatedRoute)
  private asistenciaTecnicaService = inject(AsistenciasTecnicasService)
  private authStore = inject(AuthService)
  public eventosService = inject(EventosService)
  private utilesService = inject(UtilesService);
  private congresistaService = inject(CongresistasService)
  private asistenciaTecnicaCongresistaService = inject(AsistenciaTecnicaCongresistasService)
  private asistenciaTecnicaParticipanteService = inject(AsistenciaTecnicaParticipantesService)
  private asistenciaTecnicaAgendaService = inject(AsistenciaTecnicaAgendasService)
  private messageService = inject(NzMessageService)

  public navigationAuth = computed(() => this.authStore.navigationAuth())

  ngOnInit() {
    this.perfilAuth = this.authStore.usuarioAuth().codigoPerfil!
    this.sectorAuth = this.authStore.sector() ? Number(this.authStore.sector()?.value) : this.sectorAuth
    this.permisosPCM = this.setPermisosPCM()
    this.obtenerEventos()
    this.getPermissions()
    this.getParams()
  }

  setPermisosPCM(){
    const profilePCM = [11,12,23]
    return profilePCM.includes(this.perfilAuth)
  }
  

  obtenerEventos() {
    const vigenteId = this.permisosPCM ? 4 : 2
    const tipoEvento = this.permisosPCM ? [9] : [8]
    this.eventosService.getAllEventos(tipoEvento, 1, [vigenteId], {...this.pagination, columnSort: 'eventoId', pageSize: 100, typeSort: 'DESC'}).subscribe(resp => this.evento.set(resp.data[0]))
  }

  getParams() {
    this.loading = true
    this.route.queryParams.subscribe(params => {
      if (Object.keys(params).length > 0) {
        this.loading = false

        let campo = params['campo'] ?? 'asistenciaId'

        this.pagination.columnSort = campo
        this.pagination.currentPage = params['pagina']
        this.pagination.pageSize = params['cantidad']
        this.pagination.typeSort = params['ordenar'] ?? 'DESC'

        this.setPaginationValueToParams(params, 'codigo')
        this.setPaginationValueToParams(params, 'eventoId')
        this.setPaginationValueToParams(params, 'sectorId')
        this.setPaginationValueToParams(params, 'fechaInicio')
        this.setPaginationValueToParams(params, 'fechaFin')
        this.setPaginationValueToParams(params, 'tipoAtencion')
        this.setPaginationValueToParams(params, 'ubigeo')
     
        this.obtenerAsistenciasTecnicas()
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

  getPermissions() {
    const navigation = this.authStore.navigationAuth()!
    const atenciones = navigation.find(nav => nav.descripcionItem == 'Atenciones')
    this.atencionActions = obtenerPermisosBotones(atenciones!.botones!)    
  }

  obtenerAsistenciasTecnicas() {  
    this.loading = true
    this.asistenciaTecnicaService.getAllAsistenciasTecnicas({...this.pagination })
      .subscribe(resp => {                
        this.loading = false
        if (resp.success == true) {
          this.asistenciasTecnicas.set(resp.data)
          const { pageIndex, pageSize, total } = resp.info!
          this.pagination.currentPage = pageIndex
          this.pagination.pageSize = pageSize
          this.pagination.total = total
        } else {
          this.pagination.currentPage = 1
          this.pagination.pageSize = 10
          this.pagination.total = 0
        }
      })
  }

  esDocumento(atencion: AsistenciaTecnicaResponse) : boolean{
    return this.permisosPCM && atencion.tipo == 'documento'
  }

  disabledActions(atencion: AsistenciaTecnicaResponse): boolean {
    let validado = this.esDocumento(atencion)
    if(!this.permisosPCM && this.evento()){
      validado = atencion.eventoId != this.evento()!.eventoId
    }
    return validado;
  }

  getTextEnum(value: string, kind: string): string {
    let text = value
    if (kind == 'tipo') {
      const existeTipo = this.tipos.find(item => item.value.toLowerCase() == value)
      text = existeTipo ? existeTipo.text : value
    } else if (kind == 'modalidad') {
      const existeModalidad = this.modalidades.find(item => item.value.toLowerCase() == value)
      text = existeModalidad ? existeModalidad.text : value
    } else if (kind == 'clasificacion') {
      const existeClasificacion = this.clasificaciones.find(item => item.value.toLowerCase() == value)
      text = existeClasificacion ? existeClasificacion.text : value
    }
    return text
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    // const sortsNames = ['ascend', 'descend']
    // const sorts = params.sort.find(item => sortsNames.includes(item.value!))
    // params.sort.reduce((total, item) => {
    //   return sortsNames.includes(item.value!) ? total + 1 : total
    // }, 0)
    // const campo = sorts?.key
    // const ordenar = sorts?.value!.slice(0, -3)
    // const filtrosSaved = localStorage.getItem('filtrosAtenciones');
    // let filtros:any = {}
    // if(filtrosSaved){
    //   filtros = JSON.parse(filtrosSaved)
    //   filtros.save = false      
    //   localStorage.setItem('filtrosAtenciones', JSON.stringify(filtros))
    // }    
    // this.paramsNavigate({...filtros, pagina: params.pageIndex, cantidad: params.pageSize, campo, ordenar, save: null })
    const sortsNames = ['ascend', 'descend']
    const sorts = params.sort.find(item => sortsNames.includes(item.value!))
    const qtySorts = params.sort.reduce((total, item) => {
      return sortsNames.includes(item.value!) ? total + 1 : total
    }, 0)
    const campo = sorts?.key
    const ordenar = sorts?.value!.slice(0, -3)
    const filtrosSaved = localStorage.getItem('filtrosAtenciones');

    let filtros:any = {}
    if(filtrosSaved){
      filtros = JSON.parse(filtrosSaved)
      filtros.save = false      
      localStorage.setItem('filtrosAtenciones', JSON.stringify(filtros))
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
  
      localStorage.setItem('filtrosAtenciones', JSON.stringify(pagination));
    }
  }

  validarAtencion(atencion: AsistenciaTecnicaResponse){
    this.modal.confirm({
      nzTitle: `¿Deseas validar la atencion ${atencion.codigo}?`,
      nzContent: 'La atención pasará a estar VALIDADO.',
      nzIconType: 'check-circle',
      nzOnOk: () => this.validarAtencionServicio(atencion.asistenciaId!)
    });    
    
  }

  validarAtencionServicio(asistenciaId: string){
    this.asistenciaTecnicaService.validarAsistenciaTecnica(asistenciaId)
      .subscribe( resp => {
        if(resp == true){
          this.obtenerAsistenciasTecnicas()
        }
      })
  }

  eliminarAsistencia(asistencia: AsistenciaTecnicaResponse) {
    this.confirmModal = this.modal.confirm({
      nzTitle: `¿Está seguro de eliminar la asistencia técnica? ${asistencia.codigo}`,
      nzContent: 'Esta acción no se puede deshacer.',
      nzOkText: 'Eliminar',
      nzOkDanger: true,
      nzOnOk: () => {
        this.asistenciaTecnicaService.deleteAsistenciaTecnica(asistencia.asistenciaId!)
          .subscribe(resp => {
            if (resp.success == true) {
              this.obtenerAsistenciasTecnicas()
            }
          })
      },
      nzCancelText: 'Cancelar',
    });
  }

  generateFilters(pagination: Pagination){
    const paramsInvalid: string[] = ['pageIndex','pageSize','columnSort','code','typeSort','currentPage','total','departamento','provincia','distrito','tipoEntidad','unidadOrganica','especialista']
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

  reporteExcelAtenciones(){
    this.loadingExport = true;
    this.asistenciaTecnicaService.reporteAtenciones(this.paginationFilter)
      .subscribe( resp => {
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

  updatedAsistencia(asistencia: AsistenciaTecnicaResponse) {    
    this.asistenciaTecnica = asistencia  
    this.atencionFormModal(false)
  }

  crearAsistenciaTecnica() {
    this.asistenciaTecnica = {} as AsistenciaTecnicaResponse
    this.atencionFormModal(true)
  }

  atencionFormModal(create: boolean): void{       
    const evento = this.permisosPCM ? '' : `: ${this.evento()?.nombre}`
    const codigoAtencion = create ? '' : this.asistenciaTecnica.codigo
    const action = `${create ? 'Crear' : 'Actualizar' } atención`

    const modal = this.modal.create<FormularioAtencionComponent>({
      nzTitle: `${action.toUpperCase()}${evento} ${codigoAtencion}`,
      nzWidth: '75%',
      nzMaskClosable: false,
      nzContent: FormularioAtencionComponent,
      nzData: {
        atencion: this.asistenciaTecnica,
        tipos: this.tipos,
        modalidades: this.modalidades,
        clasificaciones: this.clasificaciones,
        orientaciones: this.orientaciones,
        evento: this.evento(),
        create,
        authUser: this.authStore.usuarioAuth()
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
            const formAtencion = componentResponse!.formAtencion  
                      
            if (formAtencion.invalid) {
              const invalidFields = Object.keys(formAtencion.controls).filter(field => formAtencion.controls[field].invalid);
              console.error('Invalid fields:', invalidFields);
              return formAtencion.markAllAsTouched();
            }

            const tipoPerfil = this.permisosPCM ? 0 : 1
            const eventoId = this.evento().eventoId
            const sectorId = this.authStore.usuarioAuth().sector!.value

            const dateForm = new Date(formAtencion.get('fechaAtencion')?.value)
            const getMonth = dateForm.getMonth() + 1
            const getDay = dateForm.getDate()
            const month = getMonth > 9 ? getMonth : `0${getMonth}`
            const day = getDay > 9 ? getDay : `0${getDay}`
            const fechaAtencion = `${month}/${day}/${dateForm.getFullYear()}`
            
            formAtencion.get('fechaAtencion')?.setValue(fechaAtencion)
            formAtencion.get('tipoPerfil')?.setValue(tipoPerfil)
            formAtencion.get('eventoId')?.setValue(eventoId)
            formAtencion.get('sectorId')?.setValue(sectorId)
            formAtencion.get('validado')?.setValue(false)

            const unidadIdControl = formAtencion.get('unidadId')
            const orientacionIdControl = formAtencion.get('orientacionId')
            const dniAutoridadControl = formAtencion.get('dniAutoridad')
            const contactoAutoridadControl = formAtencion.get('contactoAutoridad')

            const unidadId = unidadIdControl?.value
            const orientacionId = orientacionIdControl?.value
            const dni = dniAutoridadControl?.value
            const contacto = contactoAutoridadControl?.value

            unidadIdControl?.setValue(unidadId ?? '')
            orientacionIdControl?.setValue(orientacionId ?? '')
            dniAutoridadControl?.setValue(dni ?? '')
            contactoAutoridadControl?.setValue(contacto ?? '')

            if(create){
              this.crearAtencion(formAtencion)
            } else  {
              this.actualizarAtencion(formAtencion)
            }
          }
        }
      ]
    })
  }

  crearAtencion(atencion: FormGroup){
    const formValues = atencion!.getRawValue()
    let congresistas = formValues.congresistas
    let participantes = formValues.participantes
    let agendas = formValues.agendas
    this.asistenciaTecnicaService.registrarAsistenciaTecnica(formValues)
            .subscribe(resp => {
              if (resp.success == true) {
                const asistencia = resp.data
                if (congresistas.length > 0) {
                  for (let data of congresistas) {
                    if (data.congresista) {
                      data.descripcion = 'Congresista'
                    }
                    const congresista: CongresistaResponse = { ...data }
                    this.congresistaService.registrarCongresista(congresista)
                      .subscribe(respCongresista => {
                        if (respCongresista.success == true) {
                          const congresistaId = respCongresista.data
                          const asistenciaCongresista: AsistenciaTecnicaCongresistaResponse = { ...data, asistenciaId: asistencia, congresistaId }
                          this.asistenciaTecnicaCongresistaService.registrarCongresista(asistenciaCongresista)
                            .subscribe(response => {
                              if (response == true) {
                              }
                            })
                        }
                      })
    
                  }
                }
                if (participantes.length > 0) {
                  for (let data of participantes) {
                    const participante: AsistenciaTecnicaParticipanteResponse = { ...data, asistenciaId: asistencia }
                    this.asistenciaTecnicaParticipanteService.registrarParticipante(participante)
                      .subscribe(response => {
                        if (response == true) {
                        }
                      })
                  }
                }
                if (agendas.length > 0) {
                  for (let data of agendas) {
                    const agenda: AsistenciaTecnicaAgendaResponse = { ...data, asistenciaId: asistencia }
                    this.asistenciaTecnicaAgendaService.registrarAgenda(agenda)
                      .subscribe(response => {
                        if (response == true) {
                        }
                      })
                  }
                }
                this.modal.closeAll()
                this.messageService.create('success', 'Se ha registrado con exito');
                this.obtenerAsistenciasTecnicas()
              } else {
                this.messageService.create('error', resp.message);
              }
            })
    
  }

  actualizarAtencion(atencion: FormGroup){
    const asistenciaId = this.asistenciaTecnica.asistenciaId
    const formValues = atencion!.getRawValue()
    let congresistas = formValues.congresistas
    let participantes = formValues.participantes
    let agendas = formValues.agendas
      this.asistenciaTecnicaService.actualizarAsistenciaTecnica({ ...formValues, asistenciaId })
        .subscribe(resp => {
          if (resp == true) { 
            if (congresistas.length > 0) {
              for (let data of congresistas) {
                if (data.congresista) {
                  data.descripcion = 'Congresista'
                }
                const congresista: CongresistaResponse = { ...data }                
                if(data.congresistaId){
                  this.congresistaService.actualizarCongresista(congresista)
                    .subscribe(respCongresista => {                      
                      if (respCongresista == true) {
                      }
                    })                  
                } else {                
                  this.congresistaService.registrarCongresista(congresista)
                    .subscribe(respCongresista => {                      
                      if (respCongresista.success == true) {
                        const congresistaId = respCongresista.data
                        const asistenciaCongresista: AsistenciaTecnicaCongresistaResponse = { ...data, asistenciaId, congresistaId }
                        this.asistenciaTecnicaCongresistaService.registrarCongresista(asistenciaCongresista)
                          .subscribe(response => {
                            if (response == true) {
                            }
                          })
                      }
                    })
                }

              }
            }
            if (participantes.length > 0) {
              for (let data of participantes) {
                if(data.participanteId){
                  this.asistenciaTecnicaParticipanteService.actualizarParticipante(data)
                    .subscribe(resp => {
                      if (resp == true) {
                      }
                    })
                } else {
                  const participante: AsistenciaTecnicaParticipanteResponse = { ...data, asistenciaId }
                  this.asistenciaTecnicaParticipanteService.registrarParticipante(participante)
                    .subscribe(resp => {
                      if (resp == true) {
                      }
                    })
                }
              }
            }
            if (agendas.length > 0) {
              for (let data of agendas) {
                if(data.agendaId){
                this.asistenciaTecnicaAgendaService.actualizarAgenda(data)
                  .subscribe(response => {
                    if (response == true) {
                    }
                  })
                } else {
                  const agenda: AsistenciaTecnicaAgendaResponse = { ...data, asistenciaId }
                  this.asistenciaTecnicaAgendaService.registrarAgenda(agenda)
                    .subscribe(response => {
                      if (response == true) {
                      }
                    })
                }
              }
            }
            this.modal.closeAll()
              this.messageService.create('success', 'Se ha actualizado con exito');
              this.obtenerAsistenciasTecnicas()
          }
        })
  }
}
