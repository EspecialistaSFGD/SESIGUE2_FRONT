import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsistenciaTecnicaAgendaResponse } from '@interfaces/asistencia-tecnica-agenda';
import { AsistenciaTecnicaParticipanteResponse } from '@interfaces/asistencia-tecnica-participante';
import { AsistenciaTecnicaResponse } from '@interfaces/asistencia-tecnica.interface';
import { ClasificacionResponse } from '@interfaces/clasificacion.interface';
import { EntidadResponse } from '@interfaces/entidad.interface';
import { EspacioResponse } from '@interfaces/espacio.interface';
import { ItemEnum } from '@interfaces/helpers.interface';
import { LugarResponse } from '@interfaces/lugar.interface';
import { NivelGobiernoResponse } from '@interfaces/nivel-gobierno.interface';
import { Pagination } from '@interfaces/pagination.interface';
import { TipoEntidadResponse } from '@interfaces/tipo-entidad.interface';
import { UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@interfaces/ubigeo.interface';
import { AsistenciaTecnicaAgendasService } from '@services/asistencia-tecnica-agendas.service';
import { AsistenciaTecnicaParticipantesService } from '@services/asistencia-tecnica-participantes.service';
import { AsistenciasTecnicasService } from '@services/asistencias-tecnicas.service';
import { ClasificacionesService } from '@services/clasificaciones.service';
import { EntidadesService } from '@services/entidades.service';
import { EspaciosService } from '@services/espacios.service';
import { LugaresService } from '@services/lugares.service';
import { NivelGobiernosService } from '@services/nivel-gobiernos.service';
import { TipoEntidadesService } from '@services/tipo-entidades.service';
import { UbigeosService } from '@services/ubigeos.service';
import { ValidatorService } from '@services/validators/validator.service';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { typeErrorControl } from '../../../helpers/forms';

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
  @Input() showModal!: boolean
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
  today = new Date();

  public lugares = signal<LugarResponse[]>([])
  public tipoEntidades = signal<TipoEntidadResponse[]>([])
  public espacios = signal<EspacioResponse[]>([])
  public gobiernoParticipantes = signal<NivelGobiernoResponse[]>([])
  public agendaClasificaciones = signal<ClasificacionResponse[]>([])

  participar: string[] = ['si', 'no']
  fileListMeet: NzUploadFile[] = [];
  fileListAttendance: NzUploadFile[] = [];

  pagination: Pagination = {
    code: 0,
    columnSort: 'lugarId',
    typeSort: 'ASC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

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

  get congresistas() {
    return this.formAsistencia.get('congresistas') as FormArray;
  }

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
    congresista: [''],
    dniCongresista: [''],
    nombreCongresista: [''],
    // cargoCongresista: [{ value: 'Congresista', disabled: true }],
    espacioId: ['', Validators.required],
    clasificacion: ['', Validators.required],
    tema: ['', Validators.required],
    comentarios: ['', Validators.required],
    evidenciaReunion: [''],
    evidenciaAsistencia: [''],
    congresistas: this.fb.array([]),
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
    if(this.asistenciaTecnica){
      const fechaAtencion = this.create ? this.today : this.asistenciaTecnica.fechaAtencion
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
      console.log('ACTION FORM DATA');
      console.log(this.asistenciaTecnica);    
      console.log(this.showModal);
  
      this.formAsistencia.reset({ ...this.asistenciaTecnica, fechaAtencion, autoridad, congresista, departamento, provincia, distrito, entidad, cargoCongresista })
    }
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

  changeTipoEntidad(){
    const provincia = this.formAsistencia.get('provincia')
    if(provincia){
      const tipo = this.obtenerValueTipoEntidad() 
      const regionales = ['GR']
      regionales.includes(tipo?.abreviatura!) ? provincia?.disable() : provincia?.enable()
      if(regionales.includes(tipo?.abreviatura!)){
        provincia?.reset()
        this.provincias.set([])
        this.distritos.set([])
      }
    }
  }

  obtenerValueTipoEntidad(){
    const tipoId = this.formAsistencia.get('tipoEntidadId')?.value
    return this.tipoEntidades().find(item => item.tipoId == tipoId ? item : null)   
  }

  disableDates = (current: Date): boolean => {
    if (!current) {
      return false;
    }
    const daysAgo = this.differenceInCalendarDays(this.today, current);
    return daysAgo < 0 || daysAgo > 2;
  };

  differenceInCalendarDays(dateLeft: Date, dateRight: Date): number {
    const startOfDayLeft = new Date(dateLeft.getFullYear(), dateLeft.getMonth(), dateLeft.getDate());
    const startOfDayRight = new Date(dateRight.getFullYear(), dateRight.getMonth(), dateRight.getDate());

    const diffInMs = startOfDayLeft.getTime() - startOfDayRight.getTime();
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  }

  changeAutoridad() {
    const autoridad = this.formAsistencia.get('autoridad')?.value
  }

  changeCongresista(index:number) {
    const congresistas = this.formAsistencia.get('congresistas') as FormArray
    const congresista = congresistas.at(index).get('congresista')?.value       
    const descripcion = congresistas.at(index).get('descripcion')
    descripcion?.setValue(congresista ? 'Congresista' : 'Representante')
    congresista ? descripcion?.disable() : descripcion?.enable()
  }

  addItemFormArray(event: MouseEvent, formGroup: string) {
    event.preventDefault();
    event.stopPropagation();
    if (formGroup == 'congresistas') {
      const congresistaRow = this.fb.group({
        congresistaId: [''],
        congresista: ['', Validators.required],
        dni: ['', [Validators.required, Validators.pattern(this.validatorService.DNIPattern)]],
        nombre: ['', Validators.required],
        descripcion: ['', Validators.required],
      })
      this.congresistas.push(congresistaRow)
    }
    if (formGroup == 'participantes') {
      const participanteRow = this.fb.group({
        participanteId: [''],
        nivelId: ['', Validators.required],
        cantidad: ['', [Validators.required, Validators.pattern(this.validatorService.NumberPattern)]],
      })
      this.participantes.push(participanteRow)
    }
    if (formGroup == 'agendas') {
      const agendaRow = this.fb.group({
        agendaId: [''],
        clasificacionId: ['', Validators.required],
        cui: [''],
      })
      this.agendas.push(agendaRow)
    }
  }

  removeItemFormArray(i: number, formGroup: string) {
    if (formGroup == 'congresistas') {
      this.congresistas.removeAt(i)
    } else if (formGroup == 'participantes') {
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

  beforeUploadMeet = (file: NzUploadFile): boolean => {
    this.fileListMeet = this.fileListMeet.concat(file);
    return false;
  };

  beforeUploadAttendance = (file: NzUploadFile): boolean => {
    this.fileListAttendance = this.fileListAttendance.concat(file);
    return false;
  };

  obtenerClasificacion() {
    const clasificacion = this.formAsistencia.get('clasificacion')?.value
    if(clasificacion){
      const agendas = this.formAsistencia.get('agendas') as FormArray
      agendas.controls.forEach(control => {
        const cui = control.get('cui')
        cui?.setErrors({ required: true })
        if(clasificacion == 'gestion'){
          cui?.disable()
          cui?.setValue('')
          cui?.clearValidators()
        } else {
          cui?.enable()
          cui?.setValidators([Validators.required, Validators.pattern(this.validatorService.NumberPattern), Validators.minLength(6), Validators.maxLength(7)])
          cui?.updateValueAndValidity()
        }        
      })
    }
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
    let congresistas = formValues.congresistas
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
            // this.resetForm()
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
            // this.resetForm()
            this.closeModal()
            this.messageService.create('success', 'Se ha actualizado con exito')
          }
        })
    }
  }
  closeModal() {
    this.showModal = false
    this.setCloseShow.emit(false)
    this.resetForm()
  }

  resetForm(){
    // this.formAsistencia.reset()
    this.congresistas.clear()
    this.participantes.clear()
    this.agendas.clear()
  }
}
