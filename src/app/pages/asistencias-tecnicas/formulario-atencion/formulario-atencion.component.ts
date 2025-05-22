import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { findEnumToText, getBusinessDays, typeErrorControl } from '@core/helpers';
import { AsistenciasTecnicasModalidad, AsistenciasTecnicasTipos, AsistenciaTecnicaResponse, ClasificacionResponse, DataModalAtencion, EntidadResponse, EspacioResponse, EventoResponse, ItemEnum, LugarResponse, NivelGobiernoResponse, Pagination, SectorResponse, TipoEntidadResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { AlcaldesService, AsistenciasTecnicasService, AsistenciaTecnicaAgendasService, AsistenciaTecnicaCongresistasService, AsistenciaTecnicaParticipantesService, ClasificacionesService, CongresistasService, EntidadesService, EspaciosService, LugaresService, NivelGobiernosService, SsiService, TipoEntidadesService, UbigeosService } from '@core/services';
import { ValidatorService } from '@core/services/validators';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { EntidadesStore } from '@libs/shared/stores/entidades.store';
import { SectoresStore } from '@libs/shared/stores/sectores.store';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzUploadFile } from 'ng-zorro-antd/upload';

@Component({
  selector: 'app-formulario-atencion',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, NgZorroModule, PrimeNgModule],
  templateUrl: './formulario-atencion.component.html',
  styles: ``
})
export class FormularioAtencionComponent {
  readonly dataAtention: DataModalAtencion = inject(NZ_MODAL_DATA);  
  atencion: AsistenciaTecnicaResponse = this.dataAtention.atencion
  clasificaciones: ItemEnum[] = this.dataAtention.clasificaciones
  modalidades: ItemEnum[] = this.dataAtention.modalidades
  orientaciones: ItemEnum[] = this.dataAtention.orientaciones
  tipos: ItemEnum[] = this.dataAtention.tipos
  create: boolean = this.dataAtention.create
  authUser = this.dataAtention.authUser

  permisosPCM: boolean = false
  esDocumento: boolean = this.atencion.tipo === AsistenciasTecnicasTipos.DOCUMENTO
  participar: string[] = ['si', 'no']
  mancomunidadSlug:string[] = ['MM','MR']
  temaCount = 1500
  comentariosCount = 900
  esMancomunidad: boolean = false
  esRegional: boolean = false
  fileListMeet: NzUploadFile[] = [];
  fileListAttendance: NzUploadFile[] = [];
  cuiClasificacion: boolean = false
  
  evento = signal<EventoResponse>(this.dataAtention.evento)
  departamentos = signal<UbigeoDepartmentResponse[]>(this.dataAtention.departamentos)
  provincias = signal<UbigeoProvinciaResponse[]>([])
  distritos = signal<UbigeoDistritoResponse[]>([])
  sectores = signal<SectorResponse[]>([])
  lugares = signal<LugarResponse[]>([])
  tipoEntidades = signal<TipoEntidadResponse[]>([])
  mancomunidades = signal<EntidadResponse[]>([])
  espacios = signal<EspacioResponse[]>([])
  gobiernoParticipantes = signal<NivelGobiernoResponse[]>([])
  agendaClasificaciones = signal<ClasificacionResponse[]>([])

  private fb = inject(FormBuilder)
  private congresistaService = inject(CongresistasService)
  private atencionService = inject(AsistenciasTecnicasService)
  private asistenciaTecnicaCongresistaService = inject(AsistenciaTecnicaCongresistasService)
  private asistenciaTecnicaParticipanteService = inject(AsistenciaTecnicaParticipantesService)
  private asistenciaTecnicaAgendaService = inject(AsistenciaTecnicaAgendasService)
  private validatorService = inject(ValidatorService)
  private ssiService = inject(SsiService)
  private lugarService = inject(LugaresService)
  private tipoEntidadService = inject(TipoEntidadesService)
  private espacioService = inject(EspaciosService)
  private nivelGobiernoService = inject(NivelGobiernosService)
  private clasificacionService = inject(ClasificacionesService)
  private ubigeoService = inject(UbigeosService)
  private entidadService = inject(EntidadesService)
  private alcaldeService = inject(AlcaldesService)

  public sectoresStore = inject(SectoresStore)
  public entidadesStore = inject(EntidadesStore)

  private timeoutId: any;
  fechaMinAtencion = new Date
  today = new Date();

  pagination: Pagination = {
    code: 0,
    columnSort: 'lugarId',
    typeSort: 'ASC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }  

  get congresistas(): FormArray {
    return this.formAtencion.get('congresistas') as FormArray;
  }

  get participantes(): FormArray {
    return this.formAtencion.get('participantes') as FormArray;
  }

  get agendas(): FormArray {
    return this.formAtencion.get('agendas') as FormArray;
  }

  public formAtencion: FormGroup = this.fb.group({
    tipoPerfil: [0 , Validators.required],
    tipo: ['', Validators.required],
    modalidad: ['', Validators.required],
    fechaAtencion: ['', Validators.required],
    eventoId: ['', Validators.required],
    sector: [{ value: '', disabled: true }],
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
    nombreAutoridad: [{ value: '', disabled: false }, Validators.required],
    documentoTitulo: [{ value: '', disabled: false }],
    numeroExpediente: [{ value: '', disabled: false }],
    cargoAutoridad: [''],
    contactoAutoridad: ['',],
    espacioId: ['', Validators.required],
    unidadId: [''],
    orientacionId: [''],
    clasificacion: [{ value: '', disabled: false }, Validators.required],
    tema: [{ value: '', disabled: false }, Validators.required],
    validado: [false, Validators.required],
    comentarios: [''],
    evidenciaReunion: [''],
    evidenciaAsistencia: [''],
    congresistas: this.fb.array([]),
    participantes: this.fb.array([]),
    agendas: this.fb.array([])
  })
  // cargoAutoridad: ['', [Validators.required, Validators.maxLength(50)]],

  ngOnInit(): void {
    this.diasHabiles()
    this.setPermisosPCM()
    this.setTipoAtencion()
    this.setModalidades()
    this.obtenerTipoEntidadesService()
    this.obtenerEspaciosService()
    this.obtenerNivelesGobiernoService()
    this.obtenerClasificacionesService()
    this.obtenerLugaresService()
    this.setFormValue()
  }

  setPermisosPCM(){
    const profilePCM = [11,12,23]
    this.permisosPCM = profilePCM.includes(this.authUser.codigoPerfil)
  }

  setFormValue(){
    const fechaAtencion = !this.create ? new Date(this.atencion.fechaAtencion) : new Date()

    const tipo = !this.permisosPCM || !this.atencion.tipo ? 'atencion' : this.atencion.tipo
    const modalidad = !this.permisosPCM || !this.atencion.modalidad ? 'presencial' : this.atencion.modalidad
    const sector = !this.permisosPCM || !this.atencion.sectorId ? this.authUser.sector.label : this.atencion.sector
    const sectorId = !this.permisosPCM || !this.atencion.sectorId ? this.authUser.sector.value : this.atencion.sectorId
    const eventoId = this.atencion.eventoId ?? this.evento().eventoId
    const unidadId = this.permisosPCM && !this.atencion.unidadId  ? '' : this.atencion.unidadId
    const orientacionId = this.permisosPCM && !this.atencion.orientacionId  ? '' : this.atencion.orientacionId
    const contactoAutoridad = this.permisosPCM && !this.atencion.contactoAutoridad  ? '' : this.atencion.contactoAutoridad
    this.formAtencion.reset({...this.atencion, tipo, modalidad, sector, sectorId, eventoId, tipoPerfil: this.permisosPCM, fechaAtencion, validado: false, unidadId, orientacionId, contactoAutoridad})

    if(!this.create){
      const orientacionId = this.formAtencion.get('orientacionId')?.value
      this.cuiClasificacion = orientacionId == 2 || orientacionId == 3 ? true : false
    }
    
    const lugarControl = this.formAtencion.get('lugarId')
    this.permisosPCM ? lugarControl?.enable() : lugarControl?.disable()
    const especiosControl = this.formAtencion.get('espacioId')
    this.permisosPCM ? especiosControl?.enable() : especiosControl?.disable()

    if(!this.permisosPCM){
      this.formAtencion.get('fechaAtencion')?.disable()
      this.formAtencion.get('tipoEntidadId')?.disable()
      this.formAtencion.get('departamento')?.disable()
      this.formAtencion.get('provincia')?.disable()
      this.formAtencion.get('distrito')?.disable()
      this.formAtencion.get('autoridad')?.disable()
      this.formAtencion.get('dniAutoridad')?.setValidators([ Validators.required, Validators.pattern(this.validatorService.DNIPattern)])
      this.formAtencion.get('orientacionId')?.setValidators([ Validators.required])
      this.formAtencion.get('unidadId')?.setValidators([ Validators.required])
      this.entidadesStore.listarEntidades(0, 1, Number(sectorId));
      this.formAtencion.get('nombreAutoridad')?.disable()
      this.formAtencion.get('cargoAutoridad')?.disable()
      this.formAtencion.get('comentarios')?.setValidators([ Validators.required])
    } else {
      if(this.esDocumento){
        this.formAtencion.get('fechaAtencion')?.disable()
        this.formAtencion.get('lugarId')?.disable()
        this.formAtencion.get('documentoTitulo')?.disable()
        this.formAtencion.get('numeroExpediente')?.disable()
        this.formAtencion.get('lugarId')?.disable()
        this.formAtencion.get('espacioId')?.disable()
        this.formAtencion.get('clasificacion')?.disable()
        this.formAtencion.get('tema')?.disable()
        this.formAtencion.get('nombreAutoridad')?.disable()
      } else {
        const autoridad = this.formAtencion.get('autoridad')
        if(autoridad && !this.create){
          this.formAtencion.get('dniAutoridad')?.disable()
          this.formAtencion.get('nombreAutoridad')?.disable()
          this.formAtencion.get('cargoAutoridad')?.disable()
        } else {
          this.formAtencion.get('cargoAutoridad')?.setValidators([Validators.required, Validators.maxLength(50)])
        }
      }
    }

    this.setFormubigeo()
    if(!this.create){
      this.setCongresistasParams()
      this.setParticipantesParams()
      this.setAgendasParams()
    }   
  }

  setFormubigeo(){
    if(!this.create){
      const departamento = this.atencion.ubigeo?.slice(0,2)
      this.formAtencion.get('departamento')?.setValue(departamento)
      if(this.atencion.tipoEntidadSlug == 'GL'){
        this.setUbigeoGL(departamento!, this.atencion.ubigeo!)
        // const controlProvincia = this.formAtencion.get('provincia')
        // const controlDistrito = this.formAtencion.get('distrito')
        // const provinciaUbigeo = this.atencion.ubigeo?.slice(0,4)
        // controlProvincia?.setValue(`${provinciaUbigeo}01`)
        // controlProvincia?.enable()
        // this.obtenerProvinciasService(departamento!)
        // const lastUbigeo = this.atencion.ubigeo?.slice(-2);
        // if(lastUbigeo != '01'){         
        //   controlDistrito?.setValue(this.atencion.ubigeo!)
        //   this.obtenerDistritosService(this.atencion.ubigeo!)
        // }  
        // controlDistrito?.enable()
      }
    }
  }

  setUbigeoGL(ubigeoDepartamento: string, ubigeo:string){
    const controlProvincia = this.formAtencion.get('provincia')
    const controlDistrito = this.formAtencion.get('distrito')
    const provinciaUbigeo = ubigeo.slice(0,4)    
    controlProvincia?.setValue(`${provinciaUbigeo}01`)
    controlProvincia?.enable()
    this.obtenerProvinciasService(ubigeoDepartamento)
    const lastUbigeo = ubigeo.slice(-2);
    if(lastUbigeo != '01'){         
      controlDistrito?.setValue(ubigeo)
      this.obtenerDistritosService(ubigeo)
    }
    if(this.permisosPCM){
      controlDistrito?.enable()
    } else {
      controlProvincia?.disable()
      controlDistrito?.disable()
    }
  }

  setTipoAtencion(){        
    const tiposExternos:string[] = [AsistenciasTecnicasTipos.ATENCION,AsistenciasTecnicasTipos.DOCUMENTO]
    const tipos:ItemEnum[] =  []    
    this.tipos.map( item => {      
      if(this.perfilPOIAtencion() && !tiposExternos.includes(item.text)){
        tipos.push(item)
      } else if(!this.permisosPCM && item.value === AsistenciasTecnicasTipos.ATENCION){
        tipos.push(item)
      }
    })
    this.tipos = tipos  
  }

  setModalidades(){
    this.modalidades = this.modalidades.filter( item => item.text != AsistenciasTecnicasModalidad.DOCUMENTO )    
  }

  obtenerLugaresService() {
    const lugarControl = this.formAtencion.get('lugarId')
    this.lugarService.getAllLugares(this.pagination)
      .subscribe(resp => {        
        if (resp.success = true) {
          const estado = this.perfilPOIAtencion() ? true : false
          const lugares: LugarResponse[] = []          
          resp.data.find(item => {
            if (item.estado == estado) {
              lugares.push(item)
            }
            if(!item.estado){
              if(!this.permisosPCM && !lugarControl?.value){
                lugarControl?.setValue(item.lugarId)
              }
            }
          })
          this.lugares.set(lugares)
        }
      })
  }

  obtenerTipoEntidadesService() {
    this.tipoEntidadService.getAllTipoEntidades({...this.pagination, columnSort: 'nombre'})
      .subscribe(resp => {        
        if (resp.success = true) {          
          const tipoEntidaes: TipoEntidadResponse[] = []
          resp.data.find(item => {
            if(this.esDocumento){              
              tipoEntidaes.push(item)
            } else {
              if(item.estado){
                tipoEntidaes.push(item)
              }
            }
          })
          this.tipoEntidades.set(tipoEntidaes)
        }
      })
  }

  obtenerEspaciosService() {
    this.espacioService.getAllEspacios({...this.pagination, columnSort: 'nombre', pageSize: 20 })
      .subscribe(resp => {
        if (resp.success = true) {
          const estado = this.perfilPOIAtencion() ? true : false
          const espacios: EspacioResponse[] = []
          resp.data.find(item => {
            if (item.estado == estado) {
              espacios.push(item)
            }
            if(!item.estado && !this.permisosPCM){
              this.formAtencion.get('espacioId')?.setValue(item.espacioId)              
            }
          })
          this.espacios.set(espacios)
        }
      })
  }

  obtenerNivelesGobiernoService() {
    this.nivelGobiernoService.getAllNivelGobiernos({...this.pagination, columnSort: 'nombre'})
      .subscribe(resp => {
        this.gobiernoParticipantes.set(resp.data)
      })
  }

  obtenerClasificacionesService() {
    this.clasificacionService.getAllClasificaciones({...this.pagination, columnSort: 'nombre'})
      .subscribe(resp => {
        if (resp.success = true) {
          const estado = this.perfilPOIAtencion() ? true : false
          const clasificaciones: ClasificacionResponse[] = []
          resp.data.find(item => {
            if (item.estado == estado) {
              clasificaciones.push(item)
            }
            if(!item.estado && !this.permisosPCM){
              const agendas = this.formAtencion.get('agendas') as FormArray
              if (agendas.length == 0) {
                this.addAgendadRow()
              }
              agendas.at(0).get('clasificacionId')?.setValue(item.clasificacionId) 
            }
          })
          this.agendaClasificaciones.set(clasificaciones)
        }
      })
  }

  perfilPOIAtencion(){
    return this.authUser.codigoPerfil === 12 || this.authUser.codigoPerfil === 23
  }

  alertMessageError(control: string) {    
    return this.formAtencion.get(control)?.errors && this.formAtencion.get(control)?.touched
  }

  alertMessageErrorTwoNivel(control: string, index: number, subcontrol: string) {
    const getControl = this.formAtencion.get(control) as FormArray
    const levelControl = getControl.at(index).get(subcontrol)
    return levelControl?.errors && levelControl?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formAtencion.get(control)?.errors;

    return typeErrorControl(text, errors)
  }

  msgErrorControlTwoNivel(control: string, index: number, subcontrol: string, label?: string): string {
    const getControl = this.formAtencion.get(control) as FormArray
    const levelControl = getControl.at(index).get(subcontrol)
    const text = label ? label : subcontrol
    const errors = levelControl?.errors;

    return typeErrorControl(text, errors)
  }

  setCongresistasParams() {
    this.asistenciaTecnicaCongresistaService.getAllCongresistas(this.atencion.asistenciaId!, {...this.pagination, columnSort: 'congresistaId' })
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
    this.asistenciaTecnicaParticipanteService.getAllParticipantes(this.atencion.asistenciaId!, {...this.pagination, columnSort: 'participanteId'})
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
    this.asistenciaTecnicaAgendaService.getAllAgendas(this.atencion.asistenciaId!, {...this.pagination, columnSort: 'agendaId'})
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

  // obtenerFechaLaborales() {
  //   const paginationLaboral: Pagination = {
  //     code: 0,
  //     columnSort: 'fecha',
  //     typeSort: 'DESC',
  //     pageSize: 6,
  //     currentPage: 1,
  //     total: 0
  //   }

  //   const getDay = this.today.getDate()
  //   const getMonth = this.today.getMonth() + 1
  //   const day = getDay < 10 ? `0${getDay}` : getDay
  //   const month = getMonth < 10 ? `0${getMonth}` : getMonth
  //   const fecha = `${day}/${month}/${this.today.getFullYear()}`
  //   this.fechaService.fechasLaborales(fecha, paginationLaboral)
  //     .subscribe(resp => {
  //       if (resp.success == true) {
  //         const fechas = resp.data
  //         this.fechaMinAtencion = fechas[fechas.length - 1].fecha
  //       }
  //     })
  // }

  diasHabiles(){
    this.fechaMinAtencion = getBusinessDays(this.today, 14)
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

  obtenerModalidad() {
    const modalidadControl = this.formAtencion.get('modalidad')
    const lugarControl = this.formAtencion.get('lugarId')
    const lugarValue = lugarControl?.value
    const modalidad = findEnumToText(AsistenciasTecnicasModalidad,modalidadControl?.value)      
    
    if(modalidad.text == AsistenciasTecnicasModalidad.PRESENCIAL){
      if(!lugarValue){
        this.setLugarToModalidad('pcm - schell')
      } else {
        const lugar = this.lugares().find( item => item.lugarId == lugarValue )!
        if(lugar.nombre.toLowerCase() == 'virtual'){
          this.setLugarToModalidad('pcm - schell')
        }
      }
    } else {
      this.setLugarToModalidad('virtual')
    }
  }

  setLugarToModalidad(lugarModalidad: string){
    const lugarControl = this.formAtencion.get('lugarId')
    const lugar = this.lugares().find( item => item.nombre.toLowerCase() == lugarModalidad )
    lugarControl?.setValue(lugar!.lugarId)
    
  }

  obtenerLugar(){
    const modalidadControl = this.formAtencion.get('modalidad')
    const lugarControl = this.formAtencion.get('lugarId')
    const lugarValue = lugarControl?.value

    if(lugarValue){
      const lugar = this.lugares().find( item => item.lugarId == lugarValue )!
      if(lugar.nombre.toLowerCase() == AsistenciasTecnicasModalidad.VIRTUAL ){
        modalidadControl?.setValue(AsistenciasTecnicasModalidad.VIRTUAL)
      } else {
        modalidadControl?.setValue(AsistenciasTecnicasModalidad.PRESENCIAL)
      }
    }
  }

  changeTipoEntidad() {
    const tipoValue = this.formAtencion.get('tipoEntidadId')?.value   
    const tipo = this.obtenerTipoEntidad(tipoValue) 
    
    this.esMancomunidad = this.mancomunidadSlug.includes(tipo!.abreviatura)
    this.esRegional = tipo!.abreviatura == 'GR'
    const departamentoControl = this.formAtencion.get('departamento')
    const provinciaControl = this.formAtencion.get('provincia')
    const distritoControl = this.formAtencion.get('distrito')
    const autoridadControl = this.formAtencion.get('autoridad')
    this.esMancomunidad ? departamentoControl?.disable() : departamentoControl?.enable()
    this.formAtencion.get('entidadId')?.reset()
    this.formAtencion.get('entidad')?.reset()
    if(this.esMancomunidad){
      departamentoControl?.reset()
      provinciaControl?.disable()
      provinciaControl?.reset()
      this.obtenerMancomunidadesService(tipo!.abreviatura)
    } else {
      !this.esRegional && departamentoControl?.value ? provinciaControl?.enable() : provinciaControl?.disable()
      provinciaControl?.reset()
      if(departamentoControl?.value){
        const ubigeo = departamentoControl.value.departamentoId
        this.obtenerEntidadPorUbigeoService(`${ubigeo}0000`)        
      }
    }
    distritoControl?.disable()
    distritoControl?.reset()
    autoridadControl?.reset()
  }

  obtenerTipoEntidad(tipoId: number){
    return this.tipoEntidades().find(item => Number(item.tipoId!) == tipoId)
  }

  changeDepartamento(){
    const departamento = this.formAtencion.get('departamento')?.value
    const provinciaControl = this.formAtencion.get('provincia')
    const distritoControl = this.formAtencion.get('distrito')
    let ubigeo = null 
    if(departamento){
      ubigeo = `${departamento}0000`
      if(!this.esRegional){
        provinciaControl?.enable()
        this.obtenerProvinciasService(departamento)
      }
    } else {
      provinciaControl?.disable()
      provinciaControl?.reset()
    }
    
    this.formAtencion.get('ubigeo')?.setValue(ubigeo)
    this.obtenerEntidadPorUbigeoService(ubigeo ?? '0')
    distritoControl?.disable()
    distritoControl?.reset()
  }

  obtenerProvinciasService(departamento: string) {
    this.ubigeoService.getProvinces(departamento)
      .subscribe(resp => {
        this.provincias.set(resp.data)
      })
  }

  changeProvincia(){
    const departamento = this.formAtencion.get('departamento')?.value
    let ubigeo = `${departamento.departamentoId}0000`
    const provincia = this.formAtencion.get('provincia')?.value
    const distritoControl = this.formAtencion.get('distrito')    
    if(provincia && !this.esRegional){
      ubigeo = provincia
      distritoControl?.enable()
      this.obtenerDistritosService(ubigeo)
    } else {
      distritoControl?.disable()
    }    
    this.formAtencion.get('ubigeo')?.setValue(ubigeo)
    this.obtenerEntidadPorUbigeoService(ubigeo)
  }

  obtenerDistritosService(provincia: string) {
    this.ubigeoService.getDistricts(provincia)
      .subscribe(resp => {
        this.distritos.set(resp.data)
      })
  }

  changeDistrito(){
    const provincia = this.formAtencion.get('provincia')?.value
    const distrito = this.formAtencion.get('distrito')?.value   
    const ubigeo = distrito && !this.esRegional ? distrito : provincia
    this.formAtencion.get('ubigeo')?.setValue(ubigeo)
    this.obtenerEntidadPorUbigeoService(ubigeo) 
  }

  obtenerMancomunidadesService(mancomunidad: string) {
    const paginationMancomunidad = {...this.pagination, columnSort: 'entidad', pageSize: 300 }
    this.entidadService.getMancomunidades(mancomunidad, paginationMancomunidad)
      .subscribe(resp => {
        this.mancomunidades.set(resp.data)
      })
  }

  obtenerEntidadPorUbigeoService(ubigeo: string) {
    if (ubigeo) {    
      const entidadControl = this.formAtencion.get('entidad')
      const entidadIdControl = this.formAtencion.get('entidadId')
      this.entidadService.getEntidadPorUbigeo(ubigeo)
        .subscribe(resp => {
          const entidad = resp.data
          entidadControl?.setValue(entidad ? entidad.entidad : null)
          entidadIdControl?.setValue(entidad ? entidad.entidadId : null)
        })
    }
  }

  changeMancomunidad(){
    const mancomunidad = this.formAtencion.get('entidadId')?.value
    const autoridadControl = this.formAtencion.get('autoridad')
    const dniControl = this.formAtencion.get('dniAutoridad')
    const nombreControl = this.formAtencion.get('nombreAutoridad')
    const cargoControl = this.formAtencion.get('cargoAutoridad') 

    const ubigeoControl = this.formAtencion.get('ubigeo')
    const entidadControl = this.formAtencion.get('entidad')
    if(mancomunidad){
      const entidad = this.mancomunidades().find(item => item.entidadId == mancomunidad)
      entidadControl?.setValue(entidad!.entidad)
      const ubigeo = entidad!.ubigeo_oficial
      ubigeoControl?.setValue(ubigeo)
      this.formAtencion.get('departamento')?.setValue(entidad?.departamento)
      this.formAtencion.get('provincia')?.setValue(entidad?.provincia)
      this.formAtencion.get('distrito')?.setValue(entidad?.distrito)
    } else {
      entidadControl?.reset()
    }
    autoridadControl?.reset()
    dniControl?.reset()
    nombreControl?.reset()
    cargoControl?.reset()
  }

  changeAutoridad(){
    const autoridad = this.formAtencion.get('autoridad')?.value
    const ubigeo = this.formAtencion.get('ubigeo')?.value
    const dniControl = this.formAtencion.get('dniAutoridad')
    const nombreControl = this.formAtencion.get('nombreAutoridad')
    const cargoControl = this.formAtencion.get('cargoAutoridad')    
    if(autoridad && ubigeo){
      this.obtenerAlcaldePorUbigeo()
    } else {
      // dniControl?.setValidators([ Validators.pattern(this.validatorService.DNIPattern)])
      // dniControl?.reset()
      // dniControl?.enable()
      // nombreControl?.enable()
      // nombreControl?.reset()
      // cargoControl?.enable()
      // cargoControl?.reset()
    }
    if(autoridad){
      if(this.permisosPCM){
        dniControl?.disable()
      }
      nombreControl?.disable()
      cargoControl?.disable()
    } else {
      dniControl?.enable()
      if(this.permisosPCM){
        nombreControl?.enable()
        cargoControl?.enable()
        dniControl?.reset()
        nombreControl?.reset()
        cargoControl?.reset()
      } else {        
        nombreControl?.disable()
        cargoControl?.disable()
      }
    }
  }

  changeDocumentoAutoridad(){
    const dniControl = this.formAtencion.get('dniAutoridad')
    const dniValue = dniControl?.value
    if(!this.permisosPCM && dniValue.length == 8){
      const evento = this.evento().eventoId!
      this.obtenerAsistenteService(dniValue, Number(evento))
      
      // dniControl.set
      // dni: ['', [Validators.required, Validators.pattern(this.validatorService.DNIPattern)]],
    }
  }

  obtenerAsistenteService(dni: string, evento: number){
    const autoridad = this.formAtencion.get('autoridad')
    const ubigeoControl = this.formAtencion.get('ubigeo')

    const tipoEntidadId = this.formAtencion.get('tipoEntidadId')
    const departamentoControl = this.formAtencion.get('departamento')
    const provinciaControl = this.formAtencion.get('provincia')
    const distritoControl = this.formAtencion.get('distrito')
    
    const entidad = this.formAtencion.get('entidad')
    const nombre = this.formAtencion.get('nombreAutoridad')
    const cargo = this.formAtencion.get('cargoAutoridad')
    const contacto = this.formAtencion.get('contactoAutoridad')
    const entidadId = this.formAtencion.get('entidadId')
    
    this.atencionService.obtenerAsistente(dni, evento)
      .subscribe( resp => {
        // if(resp.data){          
        //   const asistente = resp.data
        //   const telefono = asistente.telefono ? `${asistente.telefono} / ` : ''
        //   entidad?.setValue(asistente.entidad)
        //   ubigeoControl?.setValue(asistente.ubigeo)
        //   const esAutoridad = asistente.cargo.toLowerCase().includes('alcalde') || asistente.cargo.toLowerCase().includes('gobernador')
        //   autoridad?.setValue(esAutoridad)          
        //   nombre?.setValue(asistente.nombres)
        //   cargo?.setValue(asistente.cargo)
        //   contacto?.setValue(`${telefono}${asistente.email}`)
        //   entidadId?.setValue(asistente.entidadId)
        //   this.setUbigeoToAsistente(asistente.ubigeo, asistente.entidadTipo)
        // }

        const asistente = resp.data
        entidad?.setValue(asistente ? asistente.entidad : '' )
        ubigeoControl?.setValue(asistente ? asistente.ubigeo : '')
        nombre?.setValue(asistente ? asistente.nombres : '')
        cargo?.setValue(asistente ? asistente.cargo : '')
        entidadId?.setValue(asistente ? asistente.entidadId : '')
        if(asistente){
          const esAutoridad = asistente.cargo.toLowerCase().includes('alcalde') || asistente.cargo.toLowerCase().includes('gobernador')
          autoridad?.setValue(esAutoridad) 
          const telefono = asistente.telefono ? `${asistente.telefono} / ` : ''
          contacto?.setValue(`${telefono}${asistente.email}`)
          this.setUbigeoToAsistente(asistente.ubigeo, asistente.entidadTipo)
        } else {
          autoridad?.reset()
          contacto?.reset()
          tipoEntidadId?.reset()
          departamentoControl?.reset()
          provinciaControl?.reset()
          distritoControl?.reset()
          const dniControl = this.formAtencion.get('dniAutoridad');
          dniControl?.setErrors({ msgBack: 'Aún no asiste al evento' });
        }
      })
  }

  setUbigeoToAsistente(ubigeo: string, entidadTipo: string){
    const tipoEntidadId = this.formAtencion.get('tipoEntidadId')
    const departamentoControl = this.formAtencion.get('departamento')

    const entidadLocal:string[] = ['MP','MD']
    let tipoEntidadSlug = entidadLocal.includes(entidadTipo) ? 'GL' : entidadTipo;

    const findTipoEntidad = this.tipoEntidades().find( item => item.abreviatura == tipoEntidadSlug )
    tipoEntidadId?.setValue(findTipoEntidad?.tipoId)

    const ubigeoDepartamento = ubigeo.slice(0,2)
    const findDepartamento = this.departamentos().find( item => item.departamentoId == ubigeoDepartamento )
    departamentoControl?.setValue(findDepartamento?.departamentoId)

    if(findTipoEntidad?.abreviatura == 'GL'){
      this.setUbigeoGL(ubigeoDepartamento, ubigeo)
    }
  }

  obtenerAlcaldePorUbigeo() {
    const ubigeoValue = this.formAtencion.get('ubigeo')?.value
    let endUbigeo = ubigeoValue.slice(-2);
    const ubigeo = endUbigeo == '01' ? ubigeoValue.slice(0, -2) : ubigeoValue
    const dniControl = this.formAtencion.get('dniAutoridad')
    const nombreControl = this.formAtencion.get('nombreAutoridad')
    const cargoControl = this.formAtencion.get('cargoAutoridad')

    this.alcaldeService.getAlcaldePorUbigeo(ubigeo)
      .subscribe(resp => {        
        if (resp.success = true) {
          const autoridad = resp.data[0]
          dniControl?.setValue(autoridad.dni)
          dniControl?.disable()
          nombreControl?.disable()
          nombreControl?.setValue(autoridad.nombre)
          cargoControl?.disable()
          cargoControl?.setValue(autoridad.cargo)
        } else {
          dniControl?.reset()
          dniControl?.enable()
          nombreControl?.enable()
          nombreControl?.reset()
          cargoControl?.enable()
          cargoControl?.reset()
        }
      })
  }

  changeCongresista(index: number) {
    const congresistas = this.formAtencion.get('congresistas') as FormArray
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
        nivelId: [null, Validators.required],
        cantidad: ['', [Validators.required, Validators.pattern(this.validatorService.NumberPattern)]],
      })
      this.participantes.push(participanteRow)
    }
    if (formGroup == 'agendas') {
      this.addAgendadRow()
    }
  }
  
  addAgendadRow() {
    const agendaRow = this.fb.group({
      agendaId: [],
      clasificacionId: [null, Validators.required],
      cui: [''],
      inversion: ['']
    })
    this.agendas.push(agendaRow)
  }

  removeItemFormArray(i: number, formGroup: string) {
    if (formGroup == 'congresistas') {
      if (!this.create) {
        const congresistas = this.formAtencion.get('congresistas') as FormArray
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
        const participantes = this.formAtencion.get('participantes') as FormArray
        const participanteId = participantes.at(i).get('participanteId')?.value
        this.asistenciaTecnicaParticipanteService.eliminarParticipante(participanteId)
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
        const agendas = this.formAtencion.get('agendas') as FormArray
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

  changeOrientacion(){

  }

  obtenerIndexParaSsi(index: number) {
    const agendas = this.formAtencion.get('agendas') as FormArray
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
    const agendas = this.formAtencion.get('agendas') as FormArray
    const inversion = agendas.at(index).get('inversion')?.value
    return inversion
  }

  beforeUploadMeet = (file: NzUploadFile): boolean => {
    const evidenciaReunion = this.formAtencion.get('evidenciaReunion')
    evidenciaReunion?.setValue(file)
    this.fileListMeet = []
    this.fileListMeet = this.fileListMeet.concat(file);
    return false;
  };

  beforeUploadAttendance = (file: NzUploadFile): boolean => {
    const evidenciaAsistencia = this.formAtencion.get('evidenciaAsistencia')
    evidenciaAsistencia?.setValue(file)
    this.fileListAttendance = []
    this.fileListAttendance = this.fileListAttendance.concat(file);
    return false;
  };

  changeTipoInversion(){
    const inversion = this.formAtencion.get('orientacionId')?.value
    this.cuiClasificacion = inversion == 2 || inversion == 3 ? true : false
    console.log(inversion);
    if(inversion){
      // const getControl = this.formAtencion.get('agendas') as FormArray
      // getControl.at(0).get('cui')?.setValidators([Validators.required])
      // console.log(getControl.at(0).get('cui')?);

    }
  }

  caracteresContador(control: string, qty: number) {
    const element = this.formAtencion.get(control)
    const value = element?.value    
    if(value){
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
    
  }

}
