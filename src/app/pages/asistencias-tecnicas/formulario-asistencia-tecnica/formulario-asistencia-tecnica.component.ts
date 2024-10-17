import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsistenciaTecnicaAgendasService } from '@services/asistencia-tecnica-agendas.service';
import { AsistenciaTecnicaCongresistasService } from '@services/asistencia-tecnica-congresistas.service';
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
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { CongresistasService } from '@services/congresistas.service';
import { AsistenciaTecnicaAgendaResponse, AsistenciaTecnicaCongresistaResponse, AsistenciaTecnicaParticipanteResponse, AsistenciaTecnicaResponse, ClasificacionResponse, CongresistaResponse, EntidadResponse, EspacioResponse, ItemEnum, LugarResponse, Pagination, TipoEntidadResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@libs/interfaces';
import { NivelGobiernoResponse } from '@libs/interfaces/nivel-gobierno.interface';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { FechaService } from '@services/fecha.service';
import { SsiService } from '@services/ssi.service';
import { typeErrorControl } from '@core/helpers';

@Component({
  selector: 'app-formulario-asistencia-tecnica',
  standalone: true,
  templateUrl: './formulario-asistencia-tecnica.component.html',
  styles: ``,
  imports: [
    CommonModule,
    NgZorroModule,
    ReactiveFormsModule,
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
  private timeoutId: any;
  fechaMinAtencion = new Date
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
  private congresistaService = inject(CongresistasService)
  private asistenciaTecnicaCongresistaService = inject(AsistenciaTecnicaCongresistasService)
  private asistenciaTecnicaParticipanteService = inject(AsistenciaTecnicaParticipantesService)
  private asistenciaTecnicaAgendaService = inject(AsistenciaTecnicaAgendasService)
  private entidadService = inject(EntidadesService)
  private messageService = inject(NzMessageService)
  private validatorService = inject(ValidatorService)
  private ssiService = inject(SsiService)
  private fechaService = inject(FechaService)

  get congresistas(): FormArray {
    return this.formAsistencia.get('congresistas') as FormArray;
  }

  get participantes(): FormArray {
    return this.formAsistencia.get('participantes') as FormArray;
  }

  get agendas(): FormArray {
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
    espacioId: ['', Validators.required],
    clasificacion: ['', Validators.required],
    tema: ['', Validators.required],
    comentarios: [''],
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
    this.obtenerFechaLaborales()
  }

  setFormData() {
    if (this.asistenciaTecnica) {
      const fechaAtencion = this.create ? this.today : this.asistenciaTecnica.fechaAtencion
      const autoridad = this.create ? '' : this.asistenciaTecnica.autoridad
      const ubigeo = this.create ? '' : this.asistenciaTecnica.ubigeoEntidad
      const departamento = this.create ? '' : ubigeo.slice(0, 2)
      const provincia = this.create ? '' : ubigeo.slice(0, 4)
      const distrito = this.create ? '' : ubigeo
      const entidad = this.create ? '' : this.asistenciaTecnica.nombreEntidad
      if (!this.create) {
        this.obtenerUbigeoProvincias(departamento)
        this.obtenerUbigeoDistrito(provincia)
        this.pagination.columnSort = 'congresistaId'
        this.asistenciaTecnicaCongresistaService.getAllCongresistas(this.asistenciaTecnica.asistenciaId!, this.pagination)
          .subscribe(resp => {
            if (resp.success == true) {
              this.congresistas.clear()
              for (let data of resp.data) {
                const congresistaRow = this.fb.group({
                  congresistaId: [data.asistenteCongresistaId],
                  congresista: [data.congresista, Validators.required],
                  dni: [data.dni, [Validators.required, Validators.pattern(this.validatorService.DNIPattern)]],
                  nombre: [data.nombre, Validators.required],
                  descripcion: [{ value: data.descripcion, disabled: data.congresista }, Validators.required],
                })
                this.congresistas.push(congresistaRow)
              }
            }
          })
        this.pagination.columnSort = 'participanteId'
        this.asistenciaTecnicaParticipanteService.getAllParticipantes(this.asistenciaTecnica.asistenciaId!, this.pagination)
          .subscribe(resp => {
            if (resp.success == true) {
              this.participantes.clear()
              for (let data of resp.data) {
                const participanteRow = this.fb.group({
                  participanteId: [data.participanteId],
                  nivelId: [data.nivelId, Validators.required],
                  cantidad: [data.cantidad, [Validators.required, Validators.pattern(this.validatorService.NumberPattern)]],
                })
                this.participantes.push(participanteRow)
              }
            }
          })
        this.pagination.columnSort = 'agendaId'
        this.asistenciaTecnicaAgendaService.getAllAgendas(this.asistenciaTecnica.asistenciaId!, this.pagination)
          .subscribe(resp => {
            if (resp.success == true) {
              this.agendas.clear()
              for (let data of resp.data) {
                const agendaRow = this.fb.group({
                  agendaId: [data.agendaId],
                  clasificacionId: [data.clasificacionId, Validators.required],
                  cui: [data.cui],
                  inversion: ['']
                })
                this.agendas.push(agendaRow)
              }
            }
          })
      }
      this.formAsistencia.reset({ ...this.asistenciaTecnica, fechaAtencion, autoridad, departamento, provincia, distrito, entidad })
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

  obtenerFechaLaborales(){
    const pagination: Pagination = {
      code: 0,
      columnSort: 'fecha',
      typeSort: 'DESC',
      pageSize: 15,
      currentPage: 1,
      total: 0
    }
    const fecha = `${this.today.getDate()}/${this.today.getMonth() + 1}/${this.today.getFullYear()}`
    this.fechaService.fechasLaborales(fecha,pagination)
      .subscribe(resp => {
        if(resp.success == true){
          const fechas = resp.data
          this.fechaMinAtencion = fechas[fechas.length - 1].fecha
        }
      })    
  }

  changeTipoEntidad() {
    this.setUbigeo()
    const departamento = this.formAsistencia.get('departamento')?.value
    this.obtenerEntidad(`${departamento}0000`)
  }

  setUbigeo(){
    const provincia = this.formAsistencia.get('provincia')
    if (provincia) {
      const distrito = this.formAsistencia.get('distrito')
      const tipo = this.obtenerValueTipoEntidad()
      const regionales = ['GR']
      regionales.includes(tipo?.abreviatura!) ? provincia?.disable() : provincia?.enable()
      regionales.includes(tipo?.abreviatura!) ? distrito?.disable() : distrito?.enable()
      if (regionales.includes(tipo?.abreviatura!)) {                
        provincia?.reset()
        distrito?.reset()
        this.provincias.set([])
        this.distritos.set([])
      }
    }
  }

  obtenerValueTipoEntidad() {
    const tipoId = this.formAsistencia.get('tipoEntidadId')?.value
    return this.tipoEntidades().find(item => item.tipoId == tipoId ? item : null)
  }

  disableDates = (current: Date): boolean => {
    const maxDate = new Date(this.today)
    const minDate = new Date(this.fechaMinAtencion)
    const diffInMs = Math.abs(maxDate.getTime() - minDate.getTime());
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24)) - 1;    
    
    if (!current) {
      return false;
    }
    const daysAgo = this.differenceInCalendarDays(this.today, current);
    return daysAgo < 0 || daysAgo > diffInDays;
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

  changeCongresista(index: number) {
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
        inversion: ['']
      })
      this.agendas.push(agendaRow)
    }
  }

  removeItemFormArray(i: number, formGroup: string) {
    if (formGroup == 'congresistas') {
      if (!this.create) {
        const congresistas = this.formAsistencia.get('congresistas') as FormArray
        const congresistaId = congresistas.at(i).get('congresistaId')?.value
        this.asistenciaTecnicaCongresistaService.eliminarCongresista(congresistaId)
        .subscribe(resp => {
          if (resp.success == true) {
            this.congresistas.removeAt(i)
          }
        })
      } else {        
        this.congresistas.removeAt(i)
      }

    } else if (formGroup == 'participantes') {
      if (!this.create) {
        const participantes = this.formAsistencia.get('participantes') as FormArray
        const participanteId = participantes.at(i).get('participanteId')?.value
        this.asistenciaTecnicaParticipanteService.eliminarAgenda(participanteId)
          .subscribe(resp => {
            if (resp.success == true) {
              this.participantes.removeAt(i)
            }
          })
      } else {
        this.participantes.removeAt(i)
      }
    } else if (formGroup == 'agendas') {
      if (!this.create) {
        const agendas = this.formAsistencia.get('agendas') as FormArray
        const agendaId = agendas.at(i).get('agendaId')?.value
        this.asistenciaTecnicaAgendaService.eliminarAgenda(agendaId)
          .subscribe(resp => {
            if (resp.success == true) {
              this.agendas.removeAt(i)
            }
          })
      } else {
        this.agendas.removeAt(i)
      }
    }
  }

  obtenerUbigeoDepartamento(ubigeo: string) {
    if (ubigeo) {
      this.formAsistencia.get('provincia')?.reset();
      this.formAsistencia.get('distrito')?.reset();
      this.districtDisabled = true
      // this.changeTipoEntidad()
      this.setUbigeo()
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
    this.fileListMeet = []
    this.fileListMeet = this.fileListMeet.concat(file);
    return false;
  };

  beforeUploadAttendance = (file: NzUploadFile): boolean => {
    this.fileListAttendance = []
    this.fileListAttendance = this.fileListAttendance.concat(file);
    return false;
  };

  obtenerClasificacion() {
    const clasificacion = this.formAsistencia.get('clasificacion')?.value
    if (clasificacion) {
      const agendas = this.formAsistencia.get('agendas') as FormArray
      agendas.controls.forEach(control => {
        const cui = control.get('cui')
        cui?.setErrors({ required: true })
        if (clasificacion == 'gestion') {
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

  obtenerIndexParaSsi(index: number){
    const agendas = this.formAsistencia.get('agendas') as FormArray
    const cui = agendas.at(index).get('cui')
    let value = cui?.value
    if(value.length > 7){
      const newValue = value.substring(0, 7);
      cui?.setValue(newValue)
    }
    if(value.length == 7){
      if (this.timeoutId) {
        clearTimeout(this.timeoutId)
      }
      this.timeoutId = setTimeout(() => {
        this.ssiService.obtenerSSIMef(value)
          .subscribe( resp => {
            console.log('VERIFIANDFO NOMBRE DE INVERSION');
            
            console.log(resp);
            
          })
      }, 1000);
    }
  }

  obtenerSSIMef(index: number){
    const agendas = this.formAsistencia.get('agendas') as FormArray
    const inversion = agendas.at(index).get('inversion')?.value
    return inversion
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
    this.fileListMeet = []
    this.fileListAttendance = []
    this.setCloseShow.emit(false)
    this.resetForm()
  }

  resetForm() {
    // this.formAsistencia.reset()
    this.congresistas.clear()
    this.participantes.clear()
    this.agendas.clear()
  }
}
