import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { AsistenciasTecnicasModalidad, AsistenciaTecnicaAgendaResponse, AsistenciaTecnicaCongresistaResponse, AsistenciaTecnicaParticipanteResponse, AsistenciaTecnicaResponse, ButtonsActions, ClasificacionResponse, CongresistaResponse, EntidadResponse, EspacioResponse, ItemEnum, LugarResponse, NivelGobiernoResponse, Pagination, SectorResponse, TipoEntidadResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { AlcaldesService, AsistenciasTecnicasService, AsistenciaTecnicaAgendasService, AsistenciaTecnicaCongresistasService, AsistenciaTecnicaParticipantesService, ClasificacionesService, CongresistasService, EntidadesService, EspaciosService, FechaService, LugaresService, NivelGobiernosService, SsiService, TipoEntidadesService, UbigeosService } from '@core/services';
import { ValidatorService } from '@core/services/validators';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { AuthService } from '@libs/services/auth/auth.service';
import { EntidadesStore } from '@libs/shared/stores/entidades.store';
import { SectoresStore } from '@libs/shared/stores/sectores.store';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';

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
  @Input() orientaciones!: ItemEnum[]
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
  mancomunidadesAbrev: string[] = ['MR', 'MM']
  tipoMancomunidad: string = ''

  entidad: EntidadResponse[] = []
  // public sectores = signal<SectorResponse[]>([])
  public lugares = signal<LugarResponse[]>([])
  public tipoEntidades = signal<TipoEntidadResponse[]>([])
  public mancomunidades = signal<EntidadResponse[]>([])
  public espacios = signal<EspacioResponse[]>([])
  public gobiernoParticipantes = signal<NivelGobiernoResponse[]>([])
  public agendaClasificaciones = signal<ClasificacionResponse[]>([])

  perfil!: number

  controlCui: boolean = false
  columnUbigeo: string = '6'
  columnaSpace: string = '6'
  columnaComments: string = '24'
  placeId: string = ''
  spaceId: string = ''
  clasificaId: string = ''
  temaCount = 1500
  comentariosCount = 900
  participar: string[] = ['si', 'no']
  fileListMeet: NzUploadFile[] = [];
  fileListAttendance: NzUploadFile[] = [];
  fileMeet: File | null = null;
  fileAttendance: File | null = null;

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
  private alcaldeService = inject(AlcaldesService)
  private authStore = inject(AuthService)

  public sectoresStore = inject(SectoresStore)
  public entidadesStore = inject(EntidadesStore)
  // entidadesStore = inject(EntidadesStore);

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
    tipoPerfil: ['', Validators.required],
    tipo: ['', Validators.required],
    modalidad: ['', Validators.required],
    fechaAtencion: ['', Validators.required],
    sectorId: ['', Validators.required],
    lugarId: ['', Validators.required],
    tipoEntidadId: ['', Validators.required],
    entidadId: ['1', Validators.required],
    departamento: ['', Validators.required],
    provincia: [{ value: '', disabled: true }],
    distrito: [{ value: '', disabled: true }],
    ubigeo: [''],
    entidad: [{ value: '', disabled: true }],
    autoridad: ['', Validators.required],
    dniAutoridad: [''],
    nombreAutoridad: ['', Validators.required],
    cargoAutoridad: ['', [Validators.required, Validators.maxLength(50)]],
    contactoAutoridad: ['',],
    espacioId: ['', Validators.required],
    unidadId: [''],
    orientacionId: [''],
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
    this.setParamsData()
  }

  getSectorAuth() {
    this.perfil = this.authStore.usuarioAuth().codigoPerfil!
    if (this.perfil === 1) {
      // this.addAgendadRow()
      this.columnUbigeo = '4'
      this.columnaSpace = '12'
      this.columnaComments = '12'
      const sectorAuth = this.authStore.sector()
      this.entidadesStore.listarEntidades(0, 1, Number(sectorAuth?.value));
      this.formAsistencia.setValidators([Validators.required])
    }
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
    this.getAllPlaces()
    this.getAllTipoEntidades()
    this.getAllEspacios()
    this.getAllNivelGobiernos()
    this.getAllClasificaciones()
    this.obtenerFechaLaborales()
    this.getSectorAuth()
  }

  setParamsData() {
    const sectorAuth = this.authStore.sector()
    const fechaAtencion = this.create ? this.today : this.asistenciaTecnica.fechaAtencion
    let tipo = this.create ? '' : this.asistenciaTecnica.tipo
    let modalidad = this.create ? '' : this.asistenciaTecnica.modalidad
    const autoridad = this.create ? '' : this.asistenciaTecnica.autoridad
    const ubigeo = this.create ? '' : this.asistenciaTecnica.ubigeoEntidad
    const departamento = this.create ? '' : ubigeo.slice(0, 2)
    const provincia = this.create ? '' : ubigeo.slice(0, 4)
    const distrito = this.create ? '' : ubigeo
    const entidad = this.create ? '' : this.asistenciaTecnica.nombreEntidad
    const orientacionId = this.create ? '' : `${this.asistenciaTecnica.orientacionId}`
    let sectorId = this.create ? `${sectorAuth?.value!}`  : this.asistenciaTecnica.sectorId
    let lugarId = this.create ? '' : this.asistenciaTecnica.lugarId
    let clasificacion = this.create ? '' : this.asistenciaTecnica.clasificacion
    let espacioId = this.create ? '' : this.asistenciaTecnica.espacioId
    let tipoPerfil = 0
    let dniAutoridad = this.create ? '' : this.asistenciaTecnica.dniAutoridad
    let contactoAutoridad = this.create ? '' : this.asistenciaTecnica.contactoAutoridad

    if (!this.create) {
      this.setCongresistasParams()
      this.setParticipantesParams()
      this.setAgendasParams()
      if (this.perfil === 1) {
        // sectorId = sectorAuth?.value! as string
      }
    } else {
      if (this.perfil === 1) {
        // sectorId = sectorAuth?.value! as string
        tipoPerfil = 1
        tipo = 'atencion'
        clasificacion = 'inversion'
        lugarId = this.placeId
        espacioId = this.spaceId
        modalidad = AsistenciasTecnicasModalidad.PRESENCIAL
      }
    }

    const setUbigeo = `${provincia}01`
    this.formAsistencia.reset({ ...this.asistenciaTecnica, tipo, fechaAtencion, autoridad, dniAutoridad, contactoAutoridad, departamento, provincia: setUbigeo, distrito, ubigeo, entidad, sectorId, lugarId, clasificacion, espacioId, tipoPerfil, modalidad, orientacionId })
  }

  setCongresistasParams() {
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
  }

  setParticipantesParams() {
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
  }

  setAgendasParams() {
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

  // setFormData() {
  //   if (this.asistenciaTecnica) {
  //     const fechaAtencion = this.create ? this.today : this.asistenciaTecnica.fechaAtencion
  //     const autoridad = this.create ? '' : this.asistenciaTecnica.autoridad
  //     const ubigeo = this.create ? '' : this.asistenciaTecnica.ubigeoEntidad
  //     const departamento = this.create ? '' : ubigeo.slice(0, 2)
  //     const provincia = this.create ? '' : ubigeo.slice(0, 4)
  //     const distrito = this.create ? '' : ubigeo
  //     const entidad = this.create ? '' : this.asistenciaTecnica.nombreEntidad
  //     let dniAutoridad = ''
  //     // this.getAllClasificaciones()
  //     if (!this.create) {
  //       this.obtenerUbigeoProvincias(departamento)
  //       this.obtenerUbigeoDistritos(provincia)
  //       this.pagination.columnSort = 'congresistaId'
  //       this.asistenciaTecnicaCongresistaService.getAllCongresistas(this.asistenciaTecnica.asistenciaId!, this.pagination)
  //         .subscribe(resp => {
  //           if (resp.success == true) {
  //             this.congresistas.clear()
  //             for (let data of resp.data) {
  //               const congresistaRow = this.fb.group({
  //                 congresistaId: [data.asistenteCongresistaId],
  //                 congresista: [data.congresista, Validators.required],
  //                 dni: [data.dni, [Validators.required, Validators.pattern(this.validatorService.DNIPattern)]],
  //                 nombre: [data.nombre, Validators.required],
  //                 descripcion: [{ value: data.descripcion, disabled: data.congresista }, Validators.required],
  //               })
  //               this.congresistas.push(congresistaRow)
  //             }
  //           }
  //         })
  //       this.pagination.columnSort = 'participanteId'
  //       this.asistenciaTecnicaParticipanteService.getAllParticipantes(this.asistenciaTecnica.asistenciaId!, this.pagination)
  //         .subscribe(resp => {
  //           if (resp.success == true) {
  //             this.participantes.clear()
  //             for (let data of resp.data) {
  //               const participanteRow = this.fb.group({
  //                 participanteId: [data.participanteId],
  //                 nivelId: [data.nivelId, Validators.required],
  //                 cantidad: [data.cantidad, [Validators.required, Validators.pattern(this.validatorService.NumberPattern)]],
  //               })
  //               this.participantes.push(participanteRow)
  //             }
  //           }
  //         })
  //       this.pagination.columnSort = 'agendaId'
  //       this.asistenciaTecnicaAgendaService.getAllAgendas(this.asistenciaTecnica.asistenciaId!, this.pagination)
  //         .subscribe(resp => {
  //           if (resp.success == true) {
  //             this.agendas.clear()
  //             for (let data of resp.data) {
  //               const agendaRow = this.fb.group({
  //                 agendaId: [data.agendaId],
  //                 clasificacionId: [data.clasificacionId, Validators.required],
  //                 cui: [data.cui],
  //                 inversion: ['']
  //               })
  //               this.agendas.push(agendaRow)
  //             }
  //           }
  //         })

  //       if (this.asistenciaTecnica.dniAutoridad) {
  //         const dni = this.asistenciaTecnica.dniAutoridad == 'null' ? '' : this.asistenciaTecnica.dniAutoridad
  //         dniAutoridad = dni
  //       }
  //       this.formAsistencia.get('entidadId')?.setValue(this.asistenciaTecnica.entidadId)
  //       this.obtenerValueTipoEntidad()
  //     }
  //     // console.log(this.asistenciaTecnica);


  //     this.formAsistencia.reset({ ...this.asistenciaTecnica, fechaAtencion, autoridad, dniAutoridad, departamento, provincia: `${provincia}01`, distrito, ubigeo, entidad })
  //     // this.changeTipoEntidad()
  //     // console.log(this.tipoMancomunidad);
  //     // console.log(this.formAsistencia.value);

  //   }
  // }

  getAllPlaces() {
    this.lugarService.getAllLugares(this.pagination)
      .subscribe(resp => {
        if (resp.success = true) {
          const estado = this.perfil === 12 ? true : false
          const lugares: LugarResponse[] = []
          resp.data.find(item => {
            if (item.estado == estado) {
              lugares.push(item)
            }
            if (!item.estado) {
              this.placeId = item.lugarId!
            }
          })
          this.lugares.set(lugares)
        }
      })
  }

  getAllTipoEntidades() {
    this.pagination.columnSort = 'nombre'
    this.tipoEntidadService.getAllTipoEntidades(this.pagination)
      .subscribe(resp => {
        if (resp.success = true) {
          this.tipoEntidades.set(resp.data)
        }
      })
  }

  getAllEspacios() {
    this.pagination.columnSort = 'nombre'
    this.pagination.pageSize = 20
    this.espacioService.getAllEspacios(this.pagination)
      .subscribe(resp => {
        if (resp.success = true) {
          const estado = this.perfil === 12 ? true : false
          const espacios: EspacioResponse[] = []
          resp.data.find(item => {
            if (item.estado == estado) {
              espacios.push(item)
            }
            if (!item.estado) {
              this.spaceId = item.espacioId!
            }
          })
          this.espacios.set(espacios)
        }
      })
  }

  getAllNivelGobiernos() {
    this.pagination.columnSort = 'nombre'
    this.nivelGobiernoService.getAllNivelGobiernos(this.pagination)
      .subscribe(resp => {
        if (resp.success = true) {
          this.gobiernoParticipantes.set(resp.data)
        }
      })
  }

  getAllClasificaciones() {
    this.pagination.columnSort = 'nombre'
    this.clasificacionService.getAllClasificaciones(this.pagination)
      .subscribe(resp => {
        if (resp.success = true) {
          const estado = this.perfil === 12 ? true : false
          const clasificaciones: ClasificacionResponse[] = []
          resp.data.find(item => {
            if (item.estado == estado) {
              clasificaciones.push(item)
            }
            if (!item.estado) {
              this.clasificaId = item.clasificacionId!
            }
          })
          this.agendaClasificaciones.set(clasificaciones)
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

  obtenerFechaLaborales() {
    const paginationLaboral: Pagination = {
      code: 0,
      columnSort: 'fecha',
      typeSort: 'DESC',
      pageSize: 6,
      currentPage: 1,
      total: 0
    }

    const getDay = this.today.getDate()
    const getMonth = this.today.getMonth() + 1
    const day = getDay < 10 ? `0${getDay}` : getDay
    const month = getMonth < 10 ? `0${getMonth}` : getMonth
    const fecha = `${day}/${month}/${this.today.getFullYear()}`
    this.fechaService.fechasLaborales(fecha, paginationLaboral)
      .subscribe(resp => {
        if (resp.success == true) {
          const fechas = resp.data
          this.fechaMinAtencion = fechas[fechas.length - 1].fecha
        }
      })
  }


  changeTipoEntidad() {
    const tipo = this.obtenerValueTipoEntidad()
    if (tipo) {
      this.tipoMancomunidad = tipo.abreviatura
      const controlDpto = this.formAsistencia.get('departamento')
      const controlProv = this.formAsistencia.get('provincia')
      const controlDist = this.formAsistencia.get('distrito')

      this.provincias.set([])
      this.distritos.set([])
      controlProv?.disable()
      this.districtDisabled = true
      // controlDist?.disable()

      controlProv?.reset()
      controlDist?.reset()

      if (this.mancomunidadesAbrev.includes(this.tipoMancomunidad)) {
        // console.log(this.tipoMancomunidad);
        controlDpto?.disable()
        // controlProv?.disable()
        // controlDist?.disable()
        controlDpto?.reset()
        // controlProv?.reset()
        // controlDist?.reset()
        this.obtenerMancomunidades()
      } else {
        controlDpto?.enable()
        // controlProv?.disable()
        // controlDist?.disable()
        // this.tipoMancomunidad == 'GL' ? controlProv?.enable() : controlProv?.reset()
        const controlUbigeo = this.formAsistencia.get('ubigeo')

        if (this.tipoMancomunidad == 'GL') {
          if (controlUbigeo?.value != '') {
            controlProv?.enable()
            const ubigeo = controlUbigeo?.value.slice(0, 2)
            this.obtenerUbigeoProvincias(ubigeo)
          } else {
            this.provincias.set([])
          }
        } else if (this.tipoMancomunidad == 'GR') {
          this.changeAutoridad()
        }
        if (controlUbigeo?.value) {
          const ubigeo = controlUbigeo?.value.slice(0, 2)
          this.obtenerEntidadPorUbigeo(`${ubigeo}0000`)
        }
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

  changeMancomunidad() {
    const entidadId = this.formAsistencia.get('entidadId')?.value
    if (entidadId) {
      this.obtnerEntidadPorId()
    }
  }

  changeAutoridad() {
    const controlAutoridad = this.formAsistencia.get('autoridad')
    const ubigeo = this.formAsistencia.get('ubigeo')?.value
    const controlDNI = this.formAsistencia.get('dniAutoridad')
    const controlNombre = this.formAsistencia.get('nombreAutoridad')
    const controlCargo = this.formAsistencia.get('cargoAutoridad')

    const autoridad = controlAutoridad?.value
    if (autoridad) {
      this.obtenerAlcaldePorUbigeo(ubigeo)
    } else {
      controlDNI?.setValue('')
      controlNombre?.setValue('')
      controlCargo?.setValue('')
    }

  }

  obtenerAlcaldePorUbigeo(ubigeo: string) {
    let mainUbigeo = ubigeo.slice(0, -2);
    let endUbigeo = ubigeo.slice(-2);
    const setUbigeo = endUbigeo == '01' ? mainUbigeo : ubigeo

    const dni = this.formAsistencia.get('dniAutoridad')
    const nombre = this.formAsistencia.get('nombreAutoridad')
    const cargo = this.formAsistencia.get('cargoAutoridad')

    this.alcaldeService.getAlcaldePorUbigeo(setUbigeo)
      .subscribe(resp => {
        if (resp.success) {
          if (resp.data.length > 0) {
            const alcalde = resp.data[0]
            dni?.setValue(alcalde.dni)
            nombre?.setValue(alcalde.nombre)
            cargo?.setValue(alcalde.cargo)
          } else {
            dni?.setValue('')
            nombre?.setValue('')
            cargo?.setValue('')
          }
        }
      })
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
      this.addAgendadRow()
      // const agendaRow = this.fb.group({
      //   agendaId: [''],
      //   clasificacionId: ['', Validators.required],
      //   cui: [''],
      //   inversion: ['']
      // })
      // this.agendas.push(agendaRow)
    }
  }

  addAgendadRow() {
    const agendaRow = this.fb.group({
      agendaId: [''],
      clasificacionId: ['', Validators.required],
      cui: [''],
      inversion: ['']
    })
    this.agendas.push(agendaRow)
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
      const controlProvincia = this.formAsistencia.get('provincia');
      const controlDistrito = this.formAsistencia.get('distrito');
      controlProvincia?.reset()
      controlDistrito?.reset()

      this.obtenerUbigeoProvincias(ubigeo)
      this.obtenerEntidadPorUbigeo(`${ubigeo}0000`)
      // this.setUbigeo()

      if (!this.mancomunidadesAbrev.includes(this.tipoMancomunidad)) {
        if (this.tipoMancomunidad == 'GL') {
          controlProvincia?.enable()
        } else if (this.tipoMancomunidad == 'GR') {
          // this.changeAutoridad()
        }
        this.changeAutoridad()
      }
    }
  }
  obtenerUbigeoProvincia(ubigeo: string) {
    if (ubigeo) {
      const ubigeoDist = ubigeo.slice(0, 4)
      this.formAsistencia.get('distrito')?.reset();
      this.obtenerUbigeoDistritos(ubigeoDist)
      this.obtenerEntidadPorUbigeo(`${ubigeo}`)
      this.changeAutoridad()
    }

  }

  obtenerUbigeoDistito(ubigeo: string) {
    if (ubigeo) {
      this.obtenerEntidadPorUbigeo(ubigeo)
      this.changeAutoridad()
    }
  }

  obtenerEntidadPorUbigeo(ubigeo: string) {
    this.formAsistencia.get('ubigeo')?.setValue(ubigeo)
    if (ubigeo) {
      this.entidadService.getEntidadPorUbigeo(ubigeo)
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

  obtnerEntidadPorId() {
    const departamento = this.formAsistencia.get('departamento')
    const provincia = this.formAsistencia.get('provincia')
    const distrito = this.formAsistencia.get('distrito')
    const ubigeo = this.formAsistencia.get('ubigeo')
    const entidadId = this.formAsistencia.get('entidadId')?.value
    if (entidadId) {
      this.entidadService.getEntidadPorId(entidadId)
        .subscribe(resp => {
          if (resp.success) {
            const entidad = resp.data[0];
            departamento?.setValue(entidad.departamento)
            provincia?.setValue(entidad.provincia)
            distrito?.setValue(entidad.distrito)
            ubigeo?.setValue(entidad.ubigeo)
          } else {
            departamento?.setValue('')
            provincia?.setValue('')
            distrito?.setValue('')
            ubigeo?.setValue('')
          }

        })
    }
  }

  obtenerMancomunidades() {
    if (this.mancomunidadesAbrev.includes(this.tipoMancomunidad)) {
      this.pagination.columnSort = 'entidad'
      this.pagination.pageSize = 300
      this.entidadService.getMancomunidades(this.tipoMancomunidad, this.pagination)
        .subscribe(resp => {
          if (resp.success == true) {
            if (resp.data.length > 0) {
              this.mancomunidades.set(resp.data)
            }
          }
        })
    }
  }

  obtenerUbigeoProvincias(departamento: string) {
    const tipoEntidad = this.formAsistencia.get('tipoEntidadId')?.value
    this.ubigeoService.getProvinces(departamento)
      .subscribe(resp => {
        if (resp.success == true) {
          // this.provinceDisabled = false
          // this.districtDisabled = true
          this.provincias.set(resp.data)
        }
      })
  }

  obtenerUbigeoDistritos(provincia: string) {
    if (provincia) {
      this.districtDisabled = false
      this.ubigeoService.getDistricts(provincia)
        .subscribe(resp => {
          if (resp.success == true) {
            this.distritos.set(resp.data)
          }
        })
    }
  }

  beforeUploadMeet = (file: NzUploadFile): boolean => {
    const evidenciaReunion = this.formAsistencia.get('evidenciaReunion')
    evidenciaReunion?.setValue(file)
    this.fileListMeet = []
    this.fileListMeet = this.fileListMeet.concat(file);
    return false;
  };

  beforeUploadAttendance = (file: NzUploadFile): boolean => {
    const evidenciaAsistencia = this.formAsistencia.get('evidenciaAsistencia')
    evidenciaAsistencia?.setValue(file)
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

  obtenerIndexParaSsi(index: number) {
    const agendas = this.formAsistencia.get('agendas') as FormArray
    const cui = agendas.at(index).get('cui')
    let value = cui?.value
    if (value.length > 7) {
      const newValue = value.substring(0, 7);
      cui?.setValue(newValue)
    }
    if (value.length == 7) {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId)
      }
      // this.timeoutId = setTimeout(() => {
      //   this.ssiService.obtenerSSIMef(value)
      //     .subscribe(resp => {
      //       console.log('VERIFIANDFO NOMBRE DE INVERSION');            
      //       console.log(resp);            
      //     })
      // }, 1000);
    }
  }

  obtenerSSIMef(index: number) {
    const agendas = this.formAsistencia.get('agendas') as FormArray
    const inversion = agendas.at(index).get('inversion')?.value
    return inversion
  }

  obtenerOrientacion() {
    const orientacion = this.formAsistencia.get('orientacionId')?.value
    const cuis: number[] = [2, 3]
    const agendas = this.formAsistencia.get('agendas') as FormArray
    if (cuis.includes(Number(orientacion))) {
      if (agendas.length == 0) {
        this.addAgendadRow()
      }
      agendas.at(0).get('clasificacionId')?.setValue(this.clasificaId)
    } else {
      this.agendas.removeAt(0)
    }
    this.controlCui = cuis.includes(Number(orientacion)) ? true : false
  }

  caracteresContador(control: string, qty: number) {
    const element = this.formAsistencia.get(control)
    const value = element?.value
    if (value.length > qty) {
      const newValue = value.substring(0, qty);
      element?.setValue(newValue)
    }
    if (control == 'tema') {
      this.temaCount = qty - value.length;
    } else {
      this.comentariosCount = qty - value.length;
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
