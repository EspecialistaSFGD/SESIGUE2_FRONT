import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { findEnumToText, getBusinessDays, typeErrorControl } from '@core/helpers';
import { AsistenciasTecnicasModalidad, AsistenciasTecnicasTipos, AsistenciaTecnicaResponse, ClasificacionResponse, DataModalAtencion, EntidadResponse, EspacioResponse, EventoResponse, ItemEnum, LugarResponse, NivelGobiernoResponse, Pagination, SectorResponse, TipoEntidadResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { AsistenciaTecnicaAgendasService, AsistenciaTecnicaCongresistasService, AsistenciaTecnicaParticipantesService, CongresistasService, LugaresService, SsiService, TipoEntidadesService, UbigeosService } from '@core/services';
import { ValidatorService } from '@core/services/validators';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { EntidadesStore } from '@libs/shared/stores/entidades.store';
import { SectoresStore } from '@libs/shared/stores/sectores.store';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-formulario-atencion',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, NgZorroModule],
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
  authUser = this.dataAtention.authUser

  permisosPCM: boolean = false
  esDocumento: boolean = this.atencion.tipo === AsistenciasTecnicasTipos.DOCUMENTO
  mancomunidadSlug:string[] = ['MM','MR']
  esMancomunidad: boolean = false
  esRegional: boolean = false
  
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
  private asistenciaTecnicaCongresistaService = inject(AsistenciaTecnicaCongresistasService)
  private asistenciaTecnicaParticipanteService = inject(AsistenciaTecnicaParticipantesService)
  private asistenciaTecnicaAgendaService = inject(AsistenciaTecnicaAgendasService)
  private validatorService = inject(ValidatorService)
  private ssiService = inject(SsiService)
  private lugarService = inject(LugaresService)
  private tipoEntidadService = inject(TipoEntidadesService)
  private ubigeoService = inject(UbigeosService)

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
    cargoAutoridad: ['', [Validators.required, Validators.maxLength(50)]],
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

  ngOnInit(): void {
    this.diasHabiles()
    this.setPermisosPCM()
    this.setTipoAtencion()
    this.setModalidades()
    this.ObtenerTipoEntidadesService()
    this.obtenerLugaresService()
    this.setFormValue()
  }

  setPermisosPCM(){
    const profilePCM = [11,12,23]
    this.permisosPCM = profilePCM.includes(this.authUser.codigoPerfil)
  }

  setFormValue(){
    //TODO: ATENCION SOLO ES CUANDO ES SECTOR
    const tipoAtencion = findEnumToText(AsistenciasTecnicasTipos,AsistenciasTecnicasTipos.ATENCION)
    const tipo = !this.permisosPCM && !this.atencion.tipo ? tipoAtencion.value.toLowerCase() : this.atencion.tipo
    const fechaAtencion = this.atencion.fechaAtencion ?? new Date()
    const modalidadPresencial = findEnumToText(AsistenciasTecnicasModalidad,AsistenciasTecnicasModalidad.PRESENCIAL)
    const modalidad = !this.permisosPCM && !this.atencion.modalidad ? modalidadPresencial.value.toLowerCase() : this.atencion.modalidad
    
    const sectorId = !this.permisosPCM && !this.atencion.sectorId ? this.authUser.sector.value : this.atencion.sectorId
    const eventoId = this.atencion.eventoId ?? this.evento().eventoId
    this.formAtencion.reset({...this.atencion, tipoPerfil: this.permisosPCM, fechaAtencion, tipo, sectorId, eventoId, modalidad})
  
    // console.log(this.atencion);
    // console.log(this.formAtencion.value); 
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
              const lugarControl = this.formAtencion.get('lugarId')
              if(!this.permisosPCM && !lugarControl?.value){
                lugarControl?.setValue(item.lugarId)
              }
            }
          })
          // this.lugarId = Number(resp.data.find(item => !item.estado)!.lugarId)

          this.lugares.set(lugares)
        }
      })
  }

  ObtenerTipoEntidadesService() {
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
    this.pagination.columnSort = 'congresistaId'
    this.asistenciaTecnicaCongresistaService.getAllCongresistas(this.atencion.asistenciaId!, this.pagination)
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
    this.asistenciaTecnicaParticipanteService.getAllParticipantes(this.atencion.asistenciaId!, this.pagination)
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
    this.asistenciaTecnicaAgendaService.getAllAgendas(this.atencion.asistenciaId!, this.pagination)
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
  }

  changeTipoEntidad() {
    const tipo = this.obtenerValueTipoEntidad()
    this.esMancomunidad = this.mancomunidadSlug.includes(tipo!.abreviatura)
    this.esRegional = tipo!.abreviatura == 'GR'
    const departamentoControl = this.formAtencion.get('departamento')
    const provinciaControl = this.formAtencion.get('provincia')
    const distritoControl = this.formAtencion.get('distrito')
    this.esMancomunidad ? departamentoControl?.disable() : departamentoControl?.enable()
    if(this.esMancomunidad){
      provinciaControl?.disable()
      distritoControl?.disable()
      departamentoControl?.reset()
      provinciaControl?.reset()
      distritoControl?.reset()
    } else {
      // this.esRegional && !departamentoControl?.value ? provinciaControl?.disable : provinciaControl?.enable()
      // this.esRegional && !departamentoControl?.value ? distritoControl?.disable : provinciaControl?.enable()
      if(this.esRegional){
        console.log('ES REGIONLA');
        
        provinciaControl?.disable
        distritoControl?.disable
        provinciaControl?.reset()
        distritoControl?.reset()
      }
    }
  }

  obtenerValueTipoEntidad() {
    const tipoId = this.formAtencion.get('tipoEntidadId')?.value
    return this.tipoEntidades().find(item => item.tipoId == tipoId ? item : null)
  }

  changeDepartamento(){
    console.log('ES DEPARTAMENTO');
    
    const departamentoControl = this.formAtencion.get('departamento')
    const ubigeoDepartamento = departamentoControl?.value
    const provinciaControl = this.formAtencion.get('provincia')
    const distritoControl = this.formAtencion.get('distrito')
    if(ubigeoDepartamento && !this.esRegional){
      this.obtenerProvinciasService(ubigeoDepartamento)
      provinciaControl?.enable()
      // distritoControl?.enable()
    } else  {
      provinciaControl?.disable()
      provinciaControl?.reset()
      distritoControl?.disable()
      distritoControl?.reset()
    }
  }

  obtenerProvinciasService(departamento: string) {
    this.ubigeoService.getProvinces(departamento)
      .subscribe(resp => {
        this.provincias.set(resp.data)
      })
  }

  changeProvincia(){
    console.log('EN PROVINCIA');
    
  }

  obtenerUbigeoDistritos(provincia: string) {
    this.ubigeoService.getDistricts(provincia)
      .subscribe(resp => {
        this.distritos.set(resp.data)
      })
  }

  changeDistrito(){
    console.log('EN DISTRITO');
  }

  changeMancomunidad(){

  }

}
