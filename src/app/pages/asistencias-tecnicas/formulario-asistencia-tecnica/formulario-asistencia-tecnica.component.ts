import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsistenciaTecnicaAgendaResponse } from '@interfaces/asistencia-tecnica-agenda';
import { AsistenciaTecnicaParticipanteResponse } from '@interfaces/asistencia-tecnica-participante';
import { AsistenciasTecnicasModalidad, AsistenciaTecnicaResponse } from '@interfaces/asistencia-tecnica.interface';
import { ClasificacionResponse } from '@interfaces/clasificacion.interface';
import { EspacioResponse } from '@interfaces/espacio.interface';
import { ItemEnum } from '@interfaces/helpers.interface';
import { LugarResponse } from '@interfaces/lugar.interface';
import { NivelGobiernoResponse } from '@interfaces/nivel-gobierno.interface';
import { Pagination } from '@interfaces/pagination.interface';
import { TipoEntidadResponse } from '@interfaces/tipo-entidad.interface';
import { UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoEntidad, UbigeoProvinciaResponse } from '@interfaces/ubigeo.interface';
import { AsistenciaTecnicaAgendasService } from '@services/asistencia-tecnica-agendas.service';
import { AsistenciaTecnicaParticipantesService } from '@services/asistencia-tecnica-participantes.service';
import { AsistenciasTecnicasService } from '@services/asistencias-tecnicas.service';
import { ClasificacionesService } from '@services/clasificaciones.service';
import { EspaciosService } from '@services/espacios.service';
import { LugaresService } from '@services/lugares.service';
import { NivelGobiernosService } from '@services/nivel-gobiernos.service';
import { TipoEntidadesService } from '@services/tipo-entidades.service';
import { UbigeosService } from '@services/ubigeos.service';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { typeErrorControl } from '../../../helpers/forms';
import { EntidadesService } from '@services/entidades.service';
import { EntidadResponse } from '@interfaces/entidad.interface';
import { ValidatorService } from '@services/validators/validator.service';

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
export class FormularioAsistenciaTecnicaComponent implements OnChanges {
  @Input() showModal: boolean = false
  @Input() tipos!: ItemEnum[]
  @Input() modalidades!: ItemEnum[]
  @Input() clasificaciones!: ItemEnum[]
  @Input() departamentos!: UbigeoDepartmentResponse[]
  @Input() asistenciaTecnica!: AsistenciaTecnicaResponse
  @Input() create: boolean = true
  @Output() setCloseShow = new EventEmitter()
  @Output() addFormDate = new EventEmitter()

  public provincias = signal<UbigeoProvinciaResponse[]>([])
  public distritos = signal<UbigeoDistritoResponse[]>([])
  provinceDisabled: boolean = true
  districtDisabled: boolean = true

  collapseParticipantes: boolean = true
  collapseAgendas: boolean = true

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
  private entidadService = inject(EntidadesService)
  private messageService = inject(NzMessageService)
  private validatorService = inject(ValidatorService)

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
    dniAutoridad: ['', [Validators.required, Validators.pattern(this.validatorService.DNIPattern)]],
    nombreAutoridad: ['', Validators.required],
    cargoAutoridad: ['', Validators.required],
    congresista: ['', Validators.required],
    dniCongresista: [''],
    nombreCongresista: [''],
    cargoCongresista: [{ value: 'Congresista', disabled: true }],
    espacioId: ['', Validators.required],
    clasificacion: ['', Validators.required],
    tema: ['', Validators.required],
    comentarios: ['', Validators.required],
    evidenciaReunion: [''],
    evidenciaAsistencia: [''],
    participantes: this.fb.array([]),
    agendas: this.fb.array([])
  })

  ngOnChanges(changes: SimpleChanges) {
    this.setFormData()
  }

  alertMessageError(control: string) {
    return this.formAsistencia.get(control)?.errors && this.formAsistencia.get(control)?.touched
  }
  alertMessageErrorTwoNivel(control: string, index: number, subcontrol: string) {
    const getControl = this.formAsistencia.get(control) as FormArray
    const levelControl = getControl.at(index).get(subcontrol)
    return levelControl?.errors && levelControl?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formAsistencia.get(control)?.errors;

    return typeErrorControl(text, errors)
  }

  msgErrorControlTwoNivel(control: string, index: number, subcontrol: string, label?: string): string {
    const getControl = this.formAsistencia.get(control) as FormArray
    const levelControl = getControl.at(index).get(subcontrol)
    const text = label ? label : subcontrol
    const errors = levelControl?.errors;

    return typeErrorControl(text, errors)
  }

  ngOnInit() {
    this.obtenerLugares()
    this.obtenerTipoEntidad()
    this.obtenerEspacios()
    this.obtenerParticipantes()
    this.obtenerAgendas()
  }

  setFormData() {
    const fechaAtencion = this.create ? '' : this.asistenciaTecnica.fechaAtencion
    const autoridad = this.create ? '' : this.asistenciaTecnica.autoridad
    const congresista = this.create ? '' : this.asistenciaTecnica.congresista
    const ubigeo = this.create ? '' : this.asistenciaTecnica.ubigeoEntidad
    const departamento = this.create ? '' : ubigeo.slice(0, 2)
    const provincia = this.create ? '' : ubigeo.slice(0, 4)
    const distrito = this.create ? '' : ubigeo
    const entidad = this.create ? '' : this.asistenciaTecnica.nombreEntidad
    const cargoCongresista = this.create ? '' : 'Congresista'
    if (!this.create) {
      this.obtenerUbigeoProvincias(departamento)
      this.obtenerUbigeoDistrito(provincia)
    }
    this.formAsistencia.reset({ ...this.asistenciaTecnica, fechaAtencion, autoridad, congresista, departamento, provincia, distrito, entidad, cargoCongresista })
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

  obtenerModalidad() {
    const modalidad = this.formAsistencia.get('modalidad')?.value
    const lugar = this.formAsistencia.get('lugarId')
    switch (modalidad) {
      case 'virtuals':
        this.lugares().map(item => {
          if (item.nombre.toLowerCase() == 'virtual') {
            lugar?.setValue(item.lugarId)
          }
        })
        break;
      case 'presencial':
        const iSchell = this.lugares().find(item => item.nombre.toLowerCase().includes('schell') ? item : null)
        const iVirtual = this.lugares().find(item => item.nombre.toLowerCase().includes('virtual') ? item : null)
        if (!lugar?.value) {
          lugar?.setValue(iSchell?.lugarId)
        } else {
          if (lugar.value == iVirtual?.lugarId) {
            lugar?.setValue(iSchell?.lugarId)
          }
        }
        break
    }
  }

  changeAutoridad() {
    const autoridad = this.formAsistencia.get('autoridad')?.value
    // this.formAsistencia.get('dniAutoridad')?.setErrors({ required: autoridad })
    // this.formAsistencia.get('nombreAutoridad')?.setErrors({ required: autoridad })
    // this.formAsistencia.get('cargoAutoridad')?.setErrors({ required: autoridad })
  }

  changeCongresista() {
    const congresista = this.formAsistencia.get('congresista')?.value
    this.formAsistencia.get('dniCongresista')?.setErrors({ required: congresista })
    this.formAsistencia.get('nombreCongresista')?.setErrors({ required: congresista })
    this.formAsistencia.get('cargoCongresista')?.setValue(congresista ? 'Congresista' : '')
  }

  addItemFormArray(event: MouseEvent, formGroup: string) {
    event.preventDefault();
    event.stopPropagation();
    if (formGroup == 'participantes') {
      this.collapseParticipantes = true
      const participanteRow = this.fb.group({
        participanteId: [''],
        nivelId: ['', Validators.required],
        cantidad: ['', [Validators.required, Validators.pattern(this.validatorService.NumberPattern)]],
      })
      this.participantes.push(participanteRow)
    }
    if (formGroup == 'agendas') {
      this.collapseAgendas = true
      const agendaRow = this.fb.group({
        agendaId: [''],
        clasificacionId: ['', Validators.required],
        cui: [''],
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

  obtenerUbigeoDepartamento(ubigeo: string) {
    if (ubigeo) {
      this.formAsistencia.get('provincia')?.reset();
      this.formAsistencia.get('distrito')?.reset();
      this.districtDisabled = true
      this.obtenerUbigeoProvincias(ubigeo)
      this.obtenerEntidad(`${ubigeo}0000`)
    }
  }
  obtenerUbigeoProvincia(ubigeo: string) {
    if (ubigeo) {
      this.formAsistencia.get('distrito')?.reset();
      this.obtenerUbigeoDistrito(ubigeo)
      this.obtenerEntidad(`${ubigeo}01`)
    }

  }

  obtenerDistito(ubigeo: string) {
    if (ubigeo) {
      this.obtenerEntidad(ubigeo)
    }
  }

  obtenerEntidad(ubigeo: string) {
    if (ubigeo) {
      this.entidadService.getEntidadporUbigeo(ubigeo)
        .subscribe(resp => {
          console.log(resp);

          if (resp.success) {
            const entidad: EntidadResponse = resp.data[0];
            this.formAsistencia.get('entidad')?.setValue(entidad.entidad)
            this.formAsistencia.get('entidadId')?.setValue(entidad.entidadId)
          } else {
            this.formAsistencia.get('entidad')?.setValue('')
            this.formAsistencia.get('entidadId')?.setValue('')
          }
        })
    }
  }

  obtenerUbigeoProvincias(departamento: string) {
    this.ubigeoService.getProvinces(departamento)
      .subscribe(resp => {
        if (resp.success == true) {
          this.provinceDisabled = false
          this.provincias.set(resp.data)
        }
      })
  }

  obtenerUbigeoDistrito(provincia: string) {
    this.ubigeoService.getDistricts(provincia)
      .subscribe(resp => {
        if (resp.success == true) {
          this.districtDisabled = false
          this.distritos.set(resp.data)
        }
      })
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = this.fileList.concat(file);
    return false;
  };

  obtenerClasificacion() {
    const clasificacion = this.formAsistencia.get('clasificacion')?.value
    console.log(clasificacion);

  }


  saveOrEdit() {
    if (this.formAsistencia.invalid) {
      return this.formAsistencia.markAllAsTouched()
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

    if (this.create) {
      this.asistenciaTecnicaService.registrarAsistenciaTecnica({ ...formValues, fechaAtencion })
        .subscribe(resp => {
          if (resp.success == true) {
            const asistencia = resp.data
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
            this.addFormDate.emit(true)
            this.showModal = false
            this.formAsistencia.reset()
            this.closeModal()
            this.messageService.create('success', 'Se ha registrado con exito')
          }
        })
    } else {
      this.asistenciaTecnicaService.actualizarAsistenciaTecnica({ ...formValues, fechaAtencion, asistenciaId: this.asistenciaTecnica.asistenciaId })
        .subscribe(resp => {
          if (resp == true) {
            this.addFormDate.emit(true)
            this.showModal = false
            this.formAsistencia.reset()
            this.messageService.create('success', 'Se ha actualizado con exito')
          }
        })
    }
  }
  closeModal() {
    this.showModal = false
    this.setCloseShow.emit(false)
    this.formAsistencia.reset()
  }
}
