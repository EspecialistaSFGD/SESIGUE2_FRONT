import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlcaldesService, AsistenciasTecnicasService, AsistenciaTecnicaAgendasService, AsistenciaTecnicaCongresistasService, AsistenciaTecnicaParticipantesService, ClasificacionesService, CongresistasService, EntidadesService, EspaciosService, FechaService, LugaresService, NivelGobiernosService, SsiService, TipoEntidadesService, UbigeosService } from '@core/services';
import { AsistenciasTecnicasModalidad, AsistenciaTecnicaAgendaResponse, AsistenciaTecnicaCongresistaResponse, AsistenciaTecnicaParticipanteResponse, AsistenciaTecnicaResponse, ClasificacionResponse, CongresistaResponse, EntidadResponse, EspacioResponse, ItemEnum, LugarResponse, NivelGobiernoResponse, Pagination, TipoEntidadResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { ValidatorService } from '@core/services/validators';
import { typeErrorControl } from '@core/helpers';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';

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
  mancomunidadesAbrev:string[] = ['MR','MM']
  tipoMancomunidad: string = ''

  entidad:EntidadResponse[] = []
  public lugares = signal<LugarResponse[]>([])
  public tipoEntidades = signal<TipoEntidadResponse[]>([])
  public mancomunidades = signal<EntidadResponse[]>([])
  public espacios = signal<EspacioResponse[]>([])
  public gobiernoParticipantes = signal<NivelGobiernoResponse[]>([])
  public agendaClasificaciones = signal<ClasificacionResponse[]>([])

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
    provincia: [{ value: '', disabled: true }],
    distrito: [{ value: '', disabled: true }],
    ubigeo: [''],
    entidad: [{ value: '', disabled: true }],
    autoridad: ['', Validators.required],
    dniAutoridad: [''],
    nombreAutoridad: ['', Validators.required],
    cargoAutoridad: ['', [Validators.required, Validators.maxLength(50)]],
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
    // this.setFormData()
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
      let dniAutoridad = ''      
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

          if(this.asistenciaTecnica.dniAutoridad){
            const dni = this.asistenciaTecnica.dniAutoridad == 'null' ? '' : this.asistenciaTecnica.dniAutoridad
            dniAutoridad = dni
          }          
          this.formAsistencia.get('entidadId')?.setValue(this.asistenciaTecnica.entidadId)
          this.obtenerValueTipoEntidad()
        }
        this.formAsistencia.reset({ ...this.asistenciaTecnica, fechaAtencion, autoridad, dniAutoridad, departamento, provincia, distrito, entidad })
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
    this.pagination.pageSize = 20
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
    this.fechaService.fechasLaborales(fecha,paginationLaboral)
      .subscribe(resp => {
        if(resp.success == true){
          const fechas = resp.data
          this.fechaMinAtencion = fechas[fechas.length - 1].fecha
        }
      })    
  }
  

  changeTipoEntidad() {
      const tipo = this.obtenerValueTipoEntidad()
      if(tipo){
        this.tipoMancomunidad = tipo.abreviatura
        const controlDpto = this.formAsistencia.get('departamento')
        const controlProv = this.formAsistencia.get('provincia')
        const controlDist = this.formAsistencia.get('distrito')
        // const controlEntidadId = this.formAsistencia.get('entidadId')

        // const gobiernos = ['GR','GL']
        this.provincias.set([])
        this.distritos.set([])
        if(this.mancomunidadesAbrev.includes(this.tipoMancomunidad)){
          controlDpto?.disable()
          controlProv?.disable()
          controlDist?.disable()
          controlDpto?.reset()
          controlProv?.reset()
          controlDist?.reset()
          this.obtenerMancomunidades()
        } else {
          controlDpto?.enable()
          controlProv?.disable()
          controlDist?.disable()
          this.tipoMancomunidad == 'GL' ? controlProv?.enable() : controlProv?.reset()
          const controlUbigeo = this.formAsistencia.get('ubigeo')
          if(this.tipoMancomunidad == 'GL'){            
            if(controlUbigeo?.value){
              const ubigeo = controlUbigeo?.value.slice(0, 2)
              this.obtenerUbigeoProvincias(ubigeo)
            } else {
              this.provincias.set([])
            }
          }
          if(controlUbigeo?.value){
            const ubigeo = controlUbigeo?.value.slice(0, 2)
            this.obtenerEntidadPorUbigeo(`${ubigeo}0000`)
          }
          controlDist?.reset()
        }
        
        // if(this.mancomunidadesAbrev.includes(this.tipoMancomunidad)){        
        //   departamento?.setValue('')
        //   provincia?.setValue('')
        //   distrito?.setValue('')
        //   departamento?.disable()
        //   provincia?.disable()
        //   distrito?.disable()
        //   entidadId?.setValue('')
        //   this.obtenerMancomunidades()
        // } else {
        //   departamento?.enable()
        //   this.setUbigeo()
        //   const departamentoValue = departamento?.value
              
        //   if(departamentoValue){
        //     this.obtenerEntidadPorUbigeo(`${departamentoValue}0000`)
        //   }
        // }
      }
  }


  // setUbigeo(){
  //   console.log('set ubigeo');
  //   const controlDpto = this.formAsistencia.get('departamento')
  //   const controlProv = this.formAsistencia.get('provincia')
  //   const controlDist = this.formAsistencia.get('distrito')  
  //   const tipo = this.obtenerValueTipoEntidad()
  //   const gobiernos = ['GR','GL']
  //   const mancomunidades = ['MM','MR']
  //   console.log(this.mancomunidadesAbrev);
  //   console.log(this.tipoMancomunidad);

  //   if(!this.mancomunidadesAbrev.includes(this.tipoMancomunidad)){
  //     console.log('Es ubigeo');
  //     if(this.tipoMancomunidad == gobiernos[0]){

  //     }
  //   }
    
  //   // if(tipo){
  //   //   // console.log(tipo);
  //   //   if(gobiernos.includes(tipo?.abreviatura!)){
  //   //     controlDpto?.enable()
  //   //     if(tipo.abreviatura == gobiernos[0]){
  //   //       controlProv?.disable()
  //   //       controlDist?.disable()
  //   //       controlProv?.reset()
  //   //       controlDist?.reset()
  //   //     } else {
  //   //       controlProv?.enable()
  //   //     }
  //   //   } else {
  //   //     controlDpto?.disable()
  //   //     controlProv?.disable()
  //   //     controlDist?.disable()
  //   //     this.provincias.set([])
  //   //     this.distritos.set([]) 
  //   //   }
  //   // }
    
  //   // regionales.includes(tipo?.abreviatura!) ? provincia?.disable() : provincia?.enable()
  //   // regionales.includes(tipo?.abreviatura!) ? distrito?.disable() : distrito?.enable()
  //   // if (regionales.includes(tipo?.abreviatura!)) {    
  //   //   provincia?.reset()
  //   //   // distrito?.reset()
  //   //   this.provincias.set([])
  //   //   this.distritos.set([])       
  //   // }
  //   // const mancomunidadMuni = ['MM']
  //   // if (mancomunidadMuni.includes(tipo?.abreviatura!)) {
  //   //   distrito?.clearValidators()
  //   // }
  //   // if(tipo){
  //   //   this.tipoMancomunidad = tipo?.abreviatura
  //   // }
  // }

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

  changeMancomunidad(){
    const entidadId = this.formAsistencia.get('entidadId')?.value
    if(entidadId){
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
    if(autoridad){
      this.obtenerAlcaldePorUbigeo(ubigeo)
    } else {
      controlDNI?.setValue('')
      controlNombre?.setValue('')
      controlCargo?.setValue('')
    }

    // if(this.mancomunidadesAbrev.includes(this.tipoMancomunidad)){
    //   // this.obtenerAlcaldePorUbigeo(ubigeo)
    //   // console.log('MANCOMUNIDAD');      
    //   // console.log(ubigeo);
      
    // } else {
    //   const autoridad = this.formAsistencia.get('autoridad')?.value
    //   const dni = this.formAsistencia.get('dniAutoridad')
    //   const nombre = this.formAsistencia.get('nombreAutoridad')
    //   const cargo = this.formAsistencia.get('cargoAutoridad')
         
    //   if(autoridad && ubigeo){
    //     this.obtenerAlcaldePorUbigeo(ubigeo)
    //   } else {
    //     dni?.setValue('')
    //     nombre?.setValue('')
    //     cargo?.setValue('')
    //   }
    //   // this.setUbigeo()
    // }
    
  }

  obtenerAlcaldePorUbigeo(ubigeo: string){
    let mainUbigeo = ubigeo.slice(0, -2);
    let endUbigeo = ubigeo.slice(-2);
    const setUbigeo = endUbigeo == '01' ? mainUbigeo : ubigeo    

    const dni = this.formAsistencia.get('dniAutoridad')
    const nombre = this.formAsistencia.get('nombreAutoridad')
    const cargo = this.formAsistencia.get('cargoAutoridad')

    this.alcaldeService.getAlcaldePorUbigeo(setUbigeo)
      .subscribe( resp => {        
        if(resp.success){
          if(resp.data.length > 0){
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
      const controlProvincia = this.formAsistencia.get('provincia');
      const controlDistrito = this.formAsistencia.get('distrito');
      controlProvincia?.reset()
      controlDistrito?.reset()

      this.obtenerUbigeoProvincias(ubigeo)
      this.obtenerEntidadPorUbigeo(`${ubigeo}0000`)
      // this.setUbigeo()

      if(!this.mancomunidadesAbrev.includes(this.tipoMancomunidad)){
        if(this.tipoMancomunidad == 'GL'){
          controlProvincia?.enable()
        }
      }
    }
  }
  obtenerUbigeoProvincia(ubigeo: string) {
    if (ubigeo) {
      console.log('provincia action');
      
      const ubigeoDist = ubigeo.slice(0, 4)
      this.formAsistencia.get('distrito')?.reset();
      this.obtenerUbigeoDistrito(ubigeoDist)
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

  obtnerEntidadPorId(){
    const departamento = this.formAsistencia.get('departamento')
    const provincia = this.formAsistencia.get('provincia')
    const distrito = this.formAsistencia.get('distrito')
    const ubigeo = this.formAsistencia.get('ubigeo')
    const entidadId = this.formAsistencia.get('entidadId')?.value
    if(entidadId){
      this.entidadService.getEntidadPorId(entidadId)
        .subscribe( resp => {
          if(resp.success){
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

  obtenerMancomunidades(){
    if(this.mancomunidadesAbrev.includes(this.tipoMancomunidad)){
      this.pagination.columnSort = 'entidad'
      this.pagination.pageSize = 300
      this.entidadService.getMancomunidades(this.tipoMancomunidad,this.pagination)
        .subscribe( resp => {
          if(resp.success == true){
            if(resp.data.length > 0){              
              this.mancomunidades.set(resp.data)
            }            
          }
        })
    }
  }

  obtenerUbigeoProvincias(departamento: string) {
    this.ubigeoService.getProvinces(departamento)
      .subscribe(resp => {
        if (resp.success == true) {
          // this.provinceDisabled = false
          // this.districtDisabled = true
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
            // console.log('VERIFIANDFO NOMBRE DE INVERSION');            
            // console.log(resp);            
          })
      }, 1000);
    }
  }

  obtenerSSIMef(index: number){
    const agendas = this.formAsistencia.get('agendas') as FormArray
    const inversion = agendas.at(index).get('inversion')?.value
    return inversion
  }

  caracteresContador(control: string, qty: number){
    const element = this.formAsistencia.get(control)
    const value = element?.value
    if(value.length > qty){
      const newValue = value.substring(0, qty);
      element?.setValue(newValue)
    }
    if(control == 'tema'){
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
