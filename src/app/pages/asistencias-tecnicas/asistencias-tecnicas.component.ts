import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AsistenciasTecnicasClasificacion, AsistenciasTecnicasModalidad, AsistenciasTecnicasTipos, AsistenciaTecnicaResponse, ButtonsActions, EventoResponse, ItemEnum, Pagination, UbigeoDepartmentResponse } from '@core/interfaces';
import { AsistenciasTecnicasService, UbigeosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
// import { PageHeaderComponent } from '@shared/layout/page-header/page-header.component';
import { EventosService } from '@core/services/eventos.service';
import { AuthService } from '@libs/services/auth/auth.service';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { UtilesService } from '@libs/shared/services/utiles.service';
import saveAs from 'file-saver';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { FiltrosAtencionComponent } from './filtros-atencion/filtros-atencion.component';
import { FormularioAsistenciaTecnicaComponent } from './formulario-asistencia-tecnica/formulario-asistencia-tecnica.component';
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
    FormularioAsistenciaTecnicaComponent,
    FiltrosAtencionComponent
  ]
})

export default class AsistenciasTecnicasComponent {
  title: string = `Lista de Atenciones`;
  public asistenciasTecnicas = signal<AsistenciaTecnicaResponse[]>([])
  public departamentos = signal<UbigeoDepartmentResponse[]>([])
  public evento = signal<EventoResponse | null>(null)

  pagination: Pagination = {
    code: 0,
    columnSort: 'fechaAtencion',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  paginationFilter: Pagination = {}

  atencionActions: ButtonsActions = {
    new: false,
    edit: false,
    delete: false
  }

  perfilAuth: number = 0
  filtrosVisible: boolean = false
  loadingExport: boolean = false
  loadingData: boolean = false
  asistenciaTecnica!: AsistenciaTecnicaResponse
  create: boolean = true
  showNzModal: boolean = false

  confirmModal?: NzModalRef;
  tipos: ItemEnum[] = Object.entries(AsistenciasTecnicasTipos).map(([value, text]) => ({ value: value.toLowerCase(), text }))
  modalidaades: ItemEnum[] = Object.entries(AsistenciasTecnicasModalidad).map(([value, text]) => ({ value: value.toLowerCase(), text }))
  clasificaciones: ItemEnum[] = Object.entries(AsistenciasTecnicasClasificacion).map(([value, text]) => ({ value: value.toLowerCase(), text }))
  public orientaciones: ItemEnum[] = [
    { value: '1', text: 'Actividad' },
    { value: '2', text: 'Proyecto' },
    { value: '3', text: 'Idea' },
    { value: '4', text: 'Programa' }
  ]

  private modal = inject(NzModalService);
  private router = inject(Router);
  private route = inject(ActivatedRoute)
  private asistenciaTecnicaService = inject(AsistenciasTecnicasService)
  private ubigeoService = inject(UbigeosService)
  private authStore = inject(AuthService)
  public eventosService = inject(EventosService)
  private utilesService = inject(UtilesService);


  public navigationAuth = computed(() => this.authStore.navigationAuth())

  constructor() {
    this.getParams()
  }

  ngOnInit() {
    this.perfilAuth = this.authStore.usuarioAuth().codigoPerfil!
    this.obtenerEventos()
    this.getPermissions()
    this.obtenerAsistenciasTecnicas()
    this.obtenerDepartamentos()
  }

  permisosPCM(){
    const profilePCM = [11,12]
    return profilePCM.includes(this.perfilAuth)
  }
  

  obtenerEventos() {
    const vigenteId = !this.permisosPCM() ? 2 : 4
    this.eventosService.getAllEventos(null, 1, [vigenteId], {...this.pagination, columnSort: 'eventoId', pageSize: 100, typeSort: 'DESC'})
      .subscribe(resp => {
        if(resp.data.length > 0){          
          this.evento.set(resp.data[0])
        }        
      })
  }

  getParams() {
    this.loadingData = true
    this.route.queryParams.subscribe(params => {
      if (Object.keys(params).length > 0) {
        // this.paramsExist = true
        this.loadingData = false
        const relations = [
          { param: 'entidad', field: 'entidadId' },
          { param: 'tipoEntidad', field: 'tipoEntidadId' },
          { param: 'espacio', field: 'espacioId' },
        ]

        let campo = params['campo'] ?? 'fechaAtencion'
        const finded = relations.find(item => item.param == campo)
        if (finded) {
          campo = finded.field
        }

        this.pagination.columnSort = campo
        this.pagination.currentPage = params['pagina']
        this.pagination.pageSize = params['cantidad']
        this.pagination.typeSort = params['ordenar'] ?? 'DESC'
        this.obtenerAsistenciasTecnicas()
      } else {
        this.pagination.columnSort = 'fechaAtencion'
      }

    });
  }

  getPermissions() {
    const navigation = this.authStore.navigationAuth()!
    const atenciones = navigation.find(nav => nav.descripcionItem == 'Atenciones')
    atenciones?.botones?.map(btn => {
      this.atencionActions.new = btn.descripcionBoton === 'Agregar' ? true : this.atencionActions.new
      this.atencionActions.edit = btn.descripcionBoton === 'Editar' ? true : this.atencionActions.edit
      this.atencionActions.delete = btn.descripcionBoton === 'Eliminar' ? true : this.atencionActions.delete
    })
  }

  obtenerAsistenciasTecnicas() {
    this.loadingData = true
    this.asistenciaTecnicaService.getAllAsistenciasTecnicas({...this.pagination, pageSize: 10})
      .subscribe(resp => {
        this.loadingData = false
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

  obtenerDepartamentos() {
    this.ubigeoService.getDepartments()
      .subscribe(resp => {
        if (resp.success == true) {
          this.departamentos.set(resp.data)
        }
      })
  }

  geDocumentAtencion(atencion: AsistenciaTecnicaResponse) : boolean{
    const type = atencion.tipo
    return type == 'documento' ? true : false
  }

  getTextEnum(value: string, kind: string): string {
    let text = value
    if (kind == 'tipo') {
      const existeTipo = this.tipos.find(item => item.value.toLowerCase() == value)
      text = existeTipo ? existeTipo.text : value
    } else if (kind == 'modalidad') {
      const existeModalidad = this.modalidaades.find(item => item.value.toLowerCase() == value)
      text = existeModalidad ? existeModalidad.text : value
    } else if (kind == 'clasificacion') {
      const existeClasificacion = this.clasificaciones.find(item => item.value.toLowerCase() == value)
      text = existeClasificacion ? existeClasificacion.text : value
    }
    return text
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const sortsNames = ['ascend', 'descend']
    const sorts = params.sort.find(item => sortsNames.includes(item.value!))
    const qtySorts = params.sort.reduce((total, item) => {
      return sortsNames.includes(item.value!) ? total + 1 : total
    }, 0)
    const ordenar = sorts?.value!.slice(0, -3)
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: { pagina: params.pageIndex, cantidad: params.pageSize, campo: sorts?.key, ordenar }
      }
    );
  }

  updatedAsistencia(asistencia: AsistenciaTecnicaResponse) {
    this.asistenciaTecnica = asistencia
    this.create = false
    this.showNzModal = true
  }

  validarAtencion(asistenciaId: string){
    this.asistenciaTecnicaService.validarAsistenciaTecnica(asistenciaId)
      .subscribe( resp => {
        if(resp == true){
          this.obtenerAsistenciasTecnicas()
        }
      })
  }

  eliminarAsistencia(asistenciaId: string) {
    this.confirmModal = this.modal.confirm({
      nzTitle: '¿Está seguro de eliminar esta asistencia técnica?',
      nzContent: 'Esta acción no se puede deshacer.',
      nzOkText: 'Eliminar',
      nzOkDanger: true,
      nzOnOk: () => {
        this.asistenciaTecnicaService.deleteAsistenciaTecnica(asistenciaId)
          .subscribe(resp => {
            if (resp.success == true) {
              this.obtenerAsistenciasTecnicas()
            }
          })
      },
      nzCancelText: 'Cancelar',
    });
  }

  getAddFormAdded(success: boolean) {
    if (success) {
      this.obtenerAsistenciasTecnicas()
      this.showNzModal = true
    }
  }

  changeDrawerFilters(visible: boolean) {
    this.filtrosVisible = visible
  }

  filtersToDrawer(paginationFilters: Pagination){
    this.paginationFilter = paginationFilters
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

  crearAsistenciaTecnica() {
    this.create = true
    const fechaAtencion = new Date();
    this.asistenciaTecnica = {
      tipoPerfil: '',
      tipo: '',
      modalidad: '',
      fechaAtencion,
      lugarId: '',
      sectorId: '',
      nombreLugar: '',
      tipoEntidadId: '',
      nombreTipoEntidad: '',
      entidadId: '',
      ubigeoEntidad: '',
      nombreEntidad: '',
      autoridad: false,
      dniAutoridad: '',
      nombreAutoridad: '',
      cargoAutoridad: '',
      contactoAutoridad: '',
      congresista: false,
      dniCongresista: '',
      nombreCongresista: '',
      clasificacion: '',
      espacioId: '',
      unidadId: '',
      orientacionId: '',
      eventoId: '',
      nombreEspacio: '',
      tema: '',
      comentarios: '',
      evidenciaReunion: '',
      evidenciaAsistencia: ''
    }
    this.showNzModal = true
    // this.generateComponentModal(true)
  }

  generateComponentModal(create: boolean): void{
    const action = `${create ? 'Crear' : 'Actualizar' } atención`
    const modal = this.modal.create<FormularioAtencionComponent>({
      nzTitle: action,
      nzWidth: '75%',
      nzContent: FormularioAtencionComponent,
      nzData: {
        asistenciaTecnica: this.asistenciaTecnica,
        tipos: this.tipos,
        modalidades: this.modalidaades,
        clasificaciones: this.clasificaciones,
        orientaciones: this.orientaciones,
        departamentos: this.departamentos
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
            console.log('actualizar o guardar formulario');
            
            // return this.acuerdosService.solicitarDesestimacionAcuerdo(componentInstance!.desestimacionForm.value).then((res) => {
            //   this.traerAcuerdos({});
            //   this.modal.closeAll();
            // });
          }
        }
      ]
    })
  }
}
