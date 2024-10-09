import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsistenciasTecnicasClasificacion, AsistenciasTecnicasModalidad, AsistenciasTecnicasTipos, AsistenciaTecnicaResponse } from '@interfaces/asistencia-tecnica.interface';
import { LugarResponse } from '@interfaces/lugar.interface';
import { UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoEntidad, UbigeoProvinciaResponse } from '@interfaces/ubigeo.interface';
import { AuthService } from '@services/auth/auth.service';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { ItemEnum } from '@interfaces/helpers.interface';
import { UbigeosService } from '@services/ubigeos.service';
import { LugaresService } from '@services/lugares.service';
import { TipoEntidadesService } from '@services/tipo-entidades.service';
import { EspaciosService } from '@services/espacios.service';
import { NivelGobiernosService } from '@services/nivel-gobiernos.service';
import { ClasificacionesService } from '@services/clasificaciones.service';
import { AsistenciasTecnicasService } from '@services/asistencias-tecnicas.service';
import { Pagination } from '@interfaces/pagination.interface';
import { TipoEntidadResponse } from '@interfaces/tipo-entidad.interface';
import { NivelGobiernoResponse } from '@interfaces/nivel-gobierno.interface';
import { EspacioResponse } from '@interfaces/espacio.interface';
import { ClasificacionResponse } from '@interfaces/clasificacion.interface';
import { AsistenciaTecnicaParticipantesService } from '@services/asistencia-tecnica-participantes.service';
import { AsistenciaTecnicaAgendasService } from '@services/asistencia-tecnica-agendas.service';
import { AsistenciaTecnicaParticipanteResponse } from '@interfaces/asistencia-tecnica-participante';
import { AsistenciaTecnicaAgendaResponse } from '@interfaces/asistencia-tecnica-agenda';

@Component({
  selector: 'app-formulario-asistencia-tecnica',
  standalone: true,
  templateUrl: './formulario-asistencia-tecnica.component.html',
  styles: ``,
  imports: [
    CommonModule,
    NzModalModule,
    ReactiveFormsModule,
    NzFormModule,
    NzRadioModule,
    NzInputModule,
    NzDatePickerModule,
    NzSelectModule,
    NzIconModule,
    NzUploadModule,
    NzCollapseModule,
    NzSpaceModule,
    NzInputNumberModule
  ]
})
export class FormularioAsistenciaTecnicaComponent {
  @Input() showModal: boolean = false
  @Input() tipos!: ItemEnum[]
  @Input() modalidades!: ItemEnum[]
  @Input() clasificaciones!: ItemEnum[]
  @Input() departamentos!: UbigeoDepartmentResponse[]
  @Input() asistenciaTecnica!: AsistenciaTecnicaResponse
  @Output() setCloseShow = new EventEmitter()
  @Output() addFormDate = new EventEmitter()

  public provincias = signal<UbigeoProvinciaResponse[]>([])
  public distritos = signal<UbigeoDistritoResponse[]>([])
  provinceDisabled: boolean = true
  districtDisabled: boolean = true

  public lugares = signal<LugarResponse[]>([])
  public tipoEntidades = signal<TipoEntidadResponse[]>([])
  public espacios = signal<EspacioResponse[]>([])
  public gobiernoParticipantes = signal<NivelGobiernoResponse[]>([])
  public agendaClasificaciones = signal<ClasificacionResponse[]>([])

  participar: string[] = ['si', 'no']
  fileList: NzUploadFile[] = [];

  pagination: Pagination = {
    code: 0,
    columnSort: 'lugarId',
    typeSort: 'ASC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  ubigeoEntidad: UbigeoEntidad = {
    id: 0,
    department: 0,
    province: 0,
    district: 0
  }

  listParticipantes: Array<{ id: number; controlInstance: string }> = [{ id: 1, controlInstance: 'text' }];

  private fb = inject(FormBuilder)
  private asistenciaTecnicaService = inject(AsistenciasTecnicasService)
  private ubigeoService = inject(UbigeosService)
  private lugarService = inject(LugaresService)
  private tipoEntidadService = inject(TipoEntidadesService)
  private espacioService = inject(EspaciosService)
  private nivelGobiernoService = inject(NivelGobiernosService)
  private clasificacionService = inject(ClasificacionesService)
  private asistenciaTecnicaParticipanteService = inject(AsistenciaTecnicaParticipantesService)
  private asistenciaTecnicaAgendaService = inject(AsistenciaTecnicaAgendasService)

  get participantes() {
    return this.formAsistencia.get('participantes') as FormArray;
  }

  get agendas() {
    return this.formAsistencia.get('agendas') as FormArray;
  }

  public formAsistencia: FormGroup = this.fb.group({
    tipo: ['', Validators.required],
    modalidad: ['', Validators.required],
    fechaAtencion: ['', Validators.required],
    lugarId: ['', Validators.required],
    tipoEntidadId: ['', Validators.required],
    entidadId: ['1', Validators.required],
    departamento: ['', Validators.required],
    provincia: ['', Validators.required],
    distrito: ['', Validators.required],
    entidad: [{ value: '', disabled: true }],
    autoridad: ['', Validators.required],
    dniAutoridad: ['', Validators.required],
    nombreAutoridad: ['', Validators.required],
    cargoAutoridad: ['', Validators.required],
    congresista: ['', Validators.required],
    dniCongresista: ['', Validators.required],
    nombreCongresista: ['', Validators.required],
    cargoCongresista: [{ value: 'Congresista', disabled: true }],
    espacioId: ['', Validators.required],
    clasificacion: ['', Validators.required],
    tema: ['', Validators.required],
    comentarios: ['', Validators.required],
    evidenciaReunion: ['', Validators.required],
    evidenciaAsistencia: ['', Validators.required],
    participantes: this.fb.array([]),
    agendas: this.fb.array([])
  })

  ngOnInit() {
    this.setFormData()
    this.obtenerLugares()
    this.obtenerTipoEntidad()
    this.obtenerEspacios()
    this.obtenerParticipantes()
    this.obtenerAgendas()
  }

  setFormData(){
    this.formAsistencia.reset({ ...this.asistenciaTecnica })
  }

  obtenerLugares() {
    this.lugarService.getAllLugares(this.pagination)
      .subscribe(resp => {
        if (resp.success = true) {
          this.lugares.set(resp.data)
        }
      })
  }

  obtenerTipoEntidad() {
    this.pagination.columnSort = 'nombre'
    this.tipoEntidadService.getAllTipoEntidades(this.pagination)
      .subscribe(resp => {
        if (resp.success = true) {
          this.tipoEntidades.set(resp.data)
        }
      })
  }

  obtenerEspacios() {
    this.pagination.columnSort = 'nombre'
    this.espacioService.getAllEspacios(this.pagination)
      .subscribe(resp => {
        if (resp.success = true) {
          this.espacios.set(resp.data)
        }
      })
  }

  obtenerParticipantes() {
    this.pagination.columnSort = 'nombre'
    this.nivelGobiernoService.getAllNivelGobiernos(this.pagination)
      .subscribe(resp => {
        if (resp.success = true) {
          this.gobiernoParticipantes.set(resp.data)
        }
      })
  }

  obtenerAgendas() {
    this.pagination.columnSort = 'nombre'
    this.clasificacionService.getAllClasificaciones(this.pagination)
      .subscribe(resp => {
        if (resp.success = true) {
          this.agendaClasificaciones.set(resp.data)
        }
      })
  }

  addItemFormArray(event: MouseEvent, formGroup: string) {
    event.preventDefault();
    event.stopPropagation();
    if (formGroup == 'participantes') {
      const participanteRow = this.fb.group({
        nivelId: ['', Validators.required],
        cantidad: ['', Validators.required],
      })
      this.participantes.push(participanteRow)
    }
    if (formGroup == 'agendas') {
      const agendaRow = this.fb.group({
        clasificacionId: ['', Validators.required],
        cui: ['', Validators.required],
      })
      this.agendas.push(agendaRow)
    }
  }

  removeItemFormArray(i: number, formGroup: string) {
    if (formGroup == 'participantes') {
      this.participantes.removeAt(i)
    } else if (formGroup == 'agendas') {
      this.agendas.removeAt(i)
    }
  }

  obtenerUbigeo(value: string, ubigeo: string) {
    if (ubigeo == 'provincias') {
      this.formAsistencia.get('provincia')?.reset();
      this.formAsistencia.get('distrito')?.reset();
      this.districtDisabled = true
      this.ubigeoService.getProvinces(value)
        .subscribe(resp => {
          if (resp.success == true) {
            this.provinceDisabled = false
            this.provincias.set(resp.data)
          }
        })
    } else if (ubigeo == 'distritos') {
      this.formAsistencia.get('distrito')?.reset();
      this.ubigeoService.getDistricts(value)
        .subscribe(resp => {
          if (resp.success == true) {
            this.districtDisabled = false
            this.distritos.set(resp.data)
          }
        })
    }
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = this.fileList.concat(file);
    return false;
  };


  saveOrEdit() {
    if (this.formAsistencia.invalid) {
      this.formAsistencia.markAllAsTouched()
    }
    const dateForm = new Date(this.formAsistencia.get('fechaAtencion')?.value)
    const getMonth = dateForm.getMonth() + 1
    const getDay = dateForm.getDate()
    const month = getMonth > 9 ? getMonth : `0${getMonth}`
    const day = getDay > 9 ? getDay : `0${getDay}`
    const fechaAtencion = `${day}/${month}/${dateForm.getFullYear()}`
    const formValues = this.formAsistencia.value
    let participantes = formValues.participantes
    let agendas = formValues.agendas
    this.asistenciaTecnicaService.registrarAsistenciaTecnica({ ... formValues, fechaAtencion })
      .subscribe(resp => {
        if(resp.success == true){
          const asistencia = resp.data
          if(participantes.length > 0){
            for(let data of participantes){
            const participante: AsistenciaTecnicaParticipanteResponse = { ...data, asistenciaId: asistencia }
            this.asistenciaTecnicaParticipanteService.registrarParticipante(participante)
              .subscribe(response => {
                if(response == true){
                }           
              })
            }
            for(let data of agendas){
              const agenda: AsistenciaTecnicaAgendaResponse = { ...data, asistenciaId: asistencia }
              this.asistenciaTecnicaAgendaService.registrarAgenda(agenda)
                .subscribe(response => {
                  if(response == true){
                  }
                })
            }
          }
          this.addFormDate.emit(true)
          this.showModal = false
          this.formAsistencia.reset()
        }
      })
  }
  closeModal() {
    this.showModal = false
    this.setCloseShow.emit(false)
  }
}
