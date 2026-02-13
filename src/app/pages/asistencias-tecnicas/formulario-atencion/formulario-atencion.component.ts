import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UbigeoTipoEnum } from '@core/enums';
import { findEnumToText, getBusinessDays, typeErrorControl } from '@core/helpers';
import { AsistenciasTecnicasModalidad, AsistenciasTecnicasTipos, AsistenciaTecnicaResponse, AsistenteAtencionResponse, ClasificacionResponse, DataFile, DataModalAtencion, EntidadResponse, EspacioResponse, EventoResponse, ItemEnum, LugarResponse, NivelGobiernoResponse, OrientacionAtencion, Pagination, SectorResponse, SSInversionTooltip, TipoEntidadResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { AsistenciasTecnicasService, AsistenciaTecnicaAgendasService, AsistenciaTecnicaCongresistasService, AsistenciaTecnicaParticipantesService, ClasificacionesService, EntidadesService, EspaciosService, LugaresService, NivelGobiernosService, SectoresService, TipoEntidadesService, UbigeosService } from '@core/services';
import { ValidatorService } from '@core/services/validators';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { SectoresStore } from '@libs/shared/stores/sectores.store';
import { BotonUploadComponent } from '@shared/boton/boton-upload/boton-upload.component';
import { BotonComponent } from '@shared/boton/boton/boton.component';
import { ProgressSpinerComponent } from '@shared/progress-spiner/progress-spiner.component';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-formulario-atencion',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, NgZorroModule, PrimeNgModule, ProgressSpinerComponent, BotonComponent, BotonUploadComponent],
  templateUrl: './formulario-atencion.component.html',
  styles: ``
})
export class FormularioAtencionComponent {
  readonly dataAtention: DataModalAtencion = inject(NZ_MODAL_DATA);  
  atencion: AsistenciaTecnicaResponse = this.dataAtention.atencion
  clasificaciones: ItemEnum[] = this.dataAtention.clasificaciones
  modalidades: ItemEnum[] = this.dataAtention.modalidades
  orientaciones: OrientacionAtencion[] = this.dataAtention.orientaciones
  tipos: ItemEnum[] = this.dataAtention.tipos
  create: boolean = this.dataAtention.create
  authUser = this.dataAtention.authUser

  ubigeoTipo: UbigeoTipoEnum = UbigeoTipoEnum.PAIS
  permisosPCM: boolean = false
  loadingAutoridad: boolean = false
  esDocumento: boolean = this.atencion.tipo === AsistenciasTecnicasTipos.DOCUMENTO
  participar: string[] = ['si', 'no']
  mancomunidadSlug:string[] = ['MM','MR']
  temaCount = 1500
  comentariosCount = 900
  acuerdosCount = 900
  esMancomunidad: boolean = false
  esRegional: boolean = false
  cuiClasificacion: boolean = false
  reNewFile: boolean = false
  entidad = signal<EntidadResponse>({} as EntidadResponse)
  
  evento = signal<EventoResponse>(this.dataAtention.evento)
  unidadesOrganicas = signal<EntidadResponse[]>([])

  departamentos = signal<UbigeoDepartmentResponse[]>([])
  provincias = signal<UbigeoProvinciaResponse[]>([])
  distritos = signal<UbigeoDistritoResponse[]>([])
  sectores = signal<SectorResponse[]>([])
  lugares = signal<LugarResponse[]>([])
  tipoEntidades = signal<TipoEntidadResponse[]>([])
  mancomunidades = signal<EntidadResponse[]>([])
  espacios = signal<EspacioResponse[]>([])
  gobiernoParticipantes = signal<NivelGobiernoResponse[]>([])
  agendaClasificaciones = signal<ClasificacionResponse[]>([])

  nivelGobiernos = signal<TipoEntidadResponse[]>([])
  listaIntegranteSectores = signal<SectorResponse[][]>([])
  listaIntegranteEntidades = signal<EntidadResponse[][]>([])
  listaIntegranteDepartamentos = signal<UbigeoDepartmentResponse[][]>([])
  listaIntegranteProvincias = signal<UbigeoProvinciaResponse[][]>([])
  listaIntegranteDistritos = signal<UbigeoDistritoResponse[][]>([])

  listaCompromisoSectores = signal<SectorResponse[][]>([])
  listaCompromisoEntidades = signal<EntidadResponse[][]>([])
  listaCompromisoDepartamentos = signal<UbigeoDepartmentResponse[][]>([])
  listaCompromisoProvincias = signal<UbigeoProvinciaResponse[][]>([])
  listaCompromisoDistritos = signal<UbigeoDistritoResponse[][]>([])

  private fb = inject(FormBuilder)
  private atencionService = inject(AsistenciasTecnicasService)
  private asistenciaTecnicaCongresistaService = inject(AsistenciaTecnicaCongresistasService)
  private asistenciaTecnicaParticipanteService = inject(AsistenciaTecnicaParticipantesService)
  private asistenciaTecnicaAgendaService = inject(AsistenciaTecnicaAgendasService)
  private validatorService = inject(ValidatorService)
  private lugarService = inject(LugaresService)
  private tipoEntidadService = inject(TipoEntidadesService)
  private espacioService = inject(EspaciosService)
  private nivelGobiernoService = inject(NivelGobiernosService)
  private clasificacionService = inject(ClasificacionesService)
  private ubigeoService = inject(UbigeosService)
  private entidadService = inject(EntidadesService)
  private sectorService = inject(SectoresService)

  public sectoresStore = inject(SectoresStore)

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

  paginationEntidad: Pagination = {
    columnSort: 'entidadId',
    typeSort: 'ASC',
    pageSize: 10,
    currentPage: 1
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

  get integrantes(): FormArray {
    return this.formAtencion.get('integrantes') as FormArray;
  }

  get compromisos(): FormArray {
    return this.formAtencion.get('compromisos') as FormArray;
  }

  public formAtencion: FormGroup = this.fb.group({
    tipoPerfil: [''],
    tipo: ['', Validators.required],
    modalidad: ['', Validators.required],
    fechaAtencion: ['', Validators.required],
    eventoId: [''],
    sector: [{ value: '', disabled: true }],
    sectorId: [''],
    lugarId: ['', Validators.required],
    tipoEntidadId: ['', Validators.required],
    entidadId: ['1', Validators.required],
    departamento: ['', Validators.required],
    departamentoNombre: [''],
    provincia: [{ value: '', disabled: true }],
    provinciaNombre: [''],
    distrito: [{ value: '', disabled: true }],
    distritoNombre: [''],
    tipoUbigeo: [''],
    ubigeoJne: [''],
    ubigeo: [''],
    entidad: [{ value: '', disabled: true }],
    entidadSlug: [{ value: '', disabled: true }],
    autoridad: [{ value: '', disabled: true }, Validators.required],
    dniAutoridad: [{ value: '', disabled: true }],
    nombreAutoridad: [{ value: '', disabled: true }, Validators.required],
    documentoTitulo: [{ value: '', disabled: true }],
    numeroExpediente: [{ value: '', disabled: true }],
    cargoAutoridad: [{ value: '', disabled: true }, Validators.required],
    contactoAutoridad: [{ value: '', disabled: true }],
    espacioId: ['', Validators.required],
    unidadId: [''],
    orientacionId: [''],
    clasificacion: [{ value: '', disabled: false }, Validators.required],
    tema: [{ value: '', disabled: false }, Validators.required],
    validado: [false],
    comentarios: [''],
    acuerdos: [''],
    evidenciaReunion: [''],
    evidenciaAsistencia: [''],
    congresistas: this.fb.array([]),
    participantes: this.fb.array([]),
    agendas: this.fb.array([]),
    integrantes: this.fb.array([]),
    compromisos: this.fb.array([])
  })

  ngOnInit(): void {
    this.diasHabiles()
    this.setPermisosPCM()
    this.setTipoAtencion()
    this.setModalidades()
    if(!this.permisosPCM){
      this.obtenerUnidadOrganicaService()
    }
    this.obtenerDepartamentos()
    this.obtenerTipoEntidadesService()
    this.obtenerEspaciosService()
    this.obtenerNivelesGobiernoService()
    this.obtenerClasificacionesService()
    this.obtenerLugaresService()
    this.setFormAtention()
  }

  setPermisosPCM(){
    const permisosStorage = localStorage.getItem('permisosPcm') ?? ''
   this.permisosPCM = JSON.parse(permisosStorage) ?? false
  }

  setFormAtention(){    
    const fechaAtencion = !this.create ? new Date(this.atencion.fechaAtencion) : new Date()
    const sector = this.authUser.sector.label
    this.formAtencion.reset({ ...this.atencion, fechaAtencion, sector })

    const autoridadControl = this.formAtencion.get('autoridad')

    if(this.create){
      if(this.evento().verificaAsistentes){
        // this.formAtencion.get('fechaAtencion')?.disable()
        this.formAtencion.get('lugarId')?.disable()
        this.formAtencion.get('tipoEntidadId')?.disable()
        this.formAtencion.get('departamento')?.disable()
        autoridadControl?.disable()
        this.formAtencion.get('dniAutoridad')?.enable()
        // this.formAtencion.get('espacioId')?.disable()
      }
    } else {
      this.paginationEntidad.pageSize = 10
      this.paginationEntidad.entidadId = Number(this.atencion.entidadId)
      this.obtenerEntidadService('ENTIDAD')
  
      autoridadControl?.enable()

      this.esMancomunidad = this.mancomunidadSlug.includes(this.atencion.tipoEntidadSlug!.toUpperCase())
      if(this.esMancomunidad){
        this.formAtencion.get('departamentoNombre')?.disable()
        this.formAtencion.get('provinciaNombre')?.disable()
        this.formAtencion.get('distritoNombre')?.disable()
        this.obtenerMancomunidadesService(this.atencion.tipoEntidadSlug!)
      }

      this.formUbigeoAtencion(this.atencion.ubigeo!, this.atencion.tipoEntidadSlug!)
      this.setParticipantesParams()
      this.setAgendasParams()
      this.setCongresistasParams()

      if(this.evento().verificaAsistentes){
        this.formAtencion.get('tipoEntidadId')?.disable()
        this.formAtencion.get('departamento')?.disable()
        this.formAtencion.get('autoridad')?.disable()
        // this.formAtencion.get('espacioId')?.disable()
      }
    }
    
    if(!this.permisosPCM){
      this.formAtencion.get('fechaAtencion')?.disable()
      this.formAtencion.get('lugarId')?.disable()
        this.formAtencion.get('espacioId')?.disable()
        
      setTimeout(() => this.verificarCuiClasificacion());
      const tipo = this.dataAtention.tipos.find(item => item.text === AsistenciasTecnicasTipos.ATENCION)
      const modalidad = this.dataAtention.modalidades.find(item => item.text === AsistenciasTecnicasModalidad.PRESENCIAL)
      this.formAtencion.get('tipo')?.setValue(tipo?.value.toLowerCase())
      this.formAtencion.get('unidadId')?.setValidators([Validators.required])
      this.formAtencion.get('modalidad')?.setValue(modalidad?.value.toLowerCase())
      this.formAtencion.get('orientacionId')?.setValidators([Validators.required])
      this.formAtencion.get('comentarios')?.setValidators([Validators.required])

    }
  }

  formUbigeoAtencion(ubigeo: string, tipoEntidadSlug: string){
    const ubigeoFirst = ubigeo.slice(0,2)
    const ubigeoFirstFour = ubigeo.slice(0,4)
    const ubigeoLast = ubigeo.slice(-2)

    const controlProvincia = this.formAtencion.get('provincia')
    const controlDistrito = this.formAtencion.get('distrito')

    this.formAtencion.get('departamento')?.setValue(ubigeoFirst)
    this.ubigeoTipo = UbigeoTipoEnum.DEPARTAMENTO
    if(tipoEntidadSlug == 'GL'){
      controlProvincia?.setValue(`${ubigeoFirstFour}01`)
      if(!this.evento().verificaAsistentes){
        controlProvincia?.enable()
      }
      this.obtenerProvinciasService(ubigeoFirst!)
      if(ubigeoLast != '01'){
        controlDistrito?.setValue(ubigeo)
        if(!this.evento().verificaAsistentes){
          controlDistrito?.enable()
        }
        this.obtenerDistritosService(ubigeo!)
      }
    }
  }

  formularioControlEnable(control: string, enable: boolean = true){
    const formularioControl = this.formAtencion.get(control)
    enable ? formularioControl?.enable() : formularioControl?.disable()
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
      this.ubigeoTipo = UbigeoTipoEnum.DISTRITO         
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
      if(this.permisosPCM && !tiposExternos.includes(item.text)){
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

  obtenerUnidadOrganicaService(){    
    const pagination: Pagination = { tipo: '1', sectorId: this.authUser.sector.value, columnSort: 'entidadId', typeSort: 'ASC', pageSize: 50, currentPage: 1 }
    this.entidadService.listarEntidades(pagination).subscribe(resp => this.unidadesOrganicas.set(resp.data))
  }

  obtenerDepartamentos(){
    this.ubigeoService.getDepartments().subscribe(resp => this.departamentos.set(resp.data))
  }

  obtenerLugaresService() {
    const lugarControl = this.formAtencion.get('lugarId')
    this.lugarService.getAllLugares(this.pagination)
      .subscribe(resp => {        
        if (resp.success = true) {
          const estado = this.permisosPCM ? true : false
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
    const gobiernoValidos: string[] = ['GR','GL']
    this.tipoEntidadService.getAllTipoEntidades({...this.pagination, columnSort: 'nombre'})
      .subscribe(resp => {        
        if (resp.success = true) {          
          const tipoEntidaes: TipoEntidadResponse[] = []
          const tipos = resp.data.filter(item => this.permisosPCM ? item.abreviatura != 'GN' : !this.evento().verificaAsistentes ? gobiernoValidos.includes(item.abreviatura.toUpperCase()) :  item )          
          tipos.find(item => {
            if(this.esDocumento){              
              tipoEntidaes.push(item)
            } else {
              if(item.estado){
                tipoEntidaes.push(item)
              }
            }
          })
          this.tipoEntidades.set(tipoEntidaes)

          if(this.permisosPCM){
            const nivelGobiernoValidos:string[] = ['GN','GR','GL']
            const nivelesGobierno = resp.data.filter( item => nivelGobiernoValidos.includes(item.abreviatura))
            this.nivelGobiernos.set(nivelesGobierno)
          }
        }
      })
  }

  obtenerEspaciosService() {
    this.espacioService.getAllEspacios({...this.pagination, columnSort: 'nombre', pageSize: 20 })
      .subscribe(resp => {
        if (resp.success = true) {
          const estado = this.permisosPCM ? true : false
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
          const estado = this.permisosPCM ? true : false
          const clasificaciones: ClasificacionResponse[] = []
          resp.data.find(item => {
            if (item.estado == estado) {
              clasificaciones.push(item)
            }
          })
          this.agendaClasificaciones.set(clasificaciones)          
        }
      })
  }

  obtenerControlValue(index: number, formGroup: string, control:string){
    const controlArray = this.formAtencion.get(formGroup) as FormArray;
    const getControl = controlArray.at(index).get(control);
    return getControl?.value
  }

  obtenerNivelGobierno(i:number, control:string){
    const getControl = this.formAtencion.get(control) as FormArray
    
    const tipoControl = getControl.at(i).get('tipo')
    const esRegionalControl = getControl.at(i).get('esRegional')
    const nivelGobiernoControl = getControl.at(i).get('nivelGobiernoId')
    const nivelGobiernoValue = nivelGobiernoControl?.value
    const sectorIdControl = getControl.at(i).get('sectorId')
    const entidadIdControl = getControl.at(i).get('entidadId')
    const departamentoControl = getControl.at(i).get('departamento')
    const provinciaControl = getControl.at(i).get('provincia')
    const distritoControl = getControl.at(i).get('distrito')

    esRegionalControl?.reset()
    if(nivelGobiernoValue){
      const nivelGobierno = this.nivelGobiernos().find(item => item.tipoId === nivelGobiernoValue)
      if(nivelGobierno!.abreviatura.toUpperCase() === 'GN'){
        tipoControl?.setValue(true)
        this.obtenerSectoresLista(i,control)
      } else {
        esRegionalControl?.setValue(nivelGobierno!.abreviatura.toUpperCase() === 'GR')
        tipoControl?.setValue(false)
        this.obtenerDepartamentosServiceLista(i, control)
        sectorIdControl?.reset()
      }
      departamentoControl?.reset()
    } else {
      tipoControl?.reset()
      sectorIdControl?.reset()
      departamentoControl?.reset()
    }
    provinciaControl?.reset()
    provinciaControl?.disable()
    distritoControl?.reset()
    distritoControl?.disable()
    entidadIdControl?.disable()
  }

  obtenerSectoresLista(i:number, control:string){
    let copySectores:any = []
    switch (control.toLowerCase()) {
      case 'integrantes': copySectores = [...this.listaIntegranteSectores()]; break;
      case 'compromisos': copySectores = [...this.listaCompromisoSectores()]; break;
    }
    
    const pagination: Pagination = { columnSort: 'grupoID', typeSort: 'ASC', pageSize: 10, currentPage: 1 }
    this.sectorService.listarSectores(pagination).subscribe(resp => {
      if(resp.success){
        copySectores[i] = resp.data
        switch (control.toLowerCase()) {
          case 'integrantes': this.listaIntegranteSectores.set(copySectores); break;
          case 'compromisos': this.listaCompromisoSectores.set(copySectores); break;
        }
      }
    })
  }

  obtenerSectorIntegrante(i:number, control:string){
    const getControl = this.formAtencion.get(control) as FormArray
    const entidadIdControl = getControl.at(i).get('entidadId')
    const sectorIdControl = getControl.at(i).get('sectorId')
    const sectorId = sectorIdControl?.value
    if(sectorId){
      entidadIdControl?.enable()
      this.obtenerEntidadesServiceLista(i,sectorId,control)
    } else {
      entidadIdControl?.reset()
      entidadIdControl?.disable()
    }
  }

  obtenerEntidadesServiceLista(i:number, sectorId:number, control:string){
    let copyEntidades:any = []
    switch (control.toLowerCase()) {
      case 'integrantes': copyEntidades = [...this.listaIntegranteEntidades()]; break;
      case 'compromisos': copyEntidades = [...this.listaCompromisoEntidades()]; break;
    }

    const pagination: Pagination = { tipo: '1', sectorId, columnSort: 'entidadId', typeSort: 'ASC', pageSize: 50, currentPage: 1 }
    this.entidadService.listarEntidades(pagination).subscribe(resp => {
      if(resp.success){
        copyEntidades[i] = resp.data
        switch (control.toLowerCase()) {
          case 'integrantes': this.listaIntegranteEntidades.set(copyEntidades); break;
          case 'compromisos': this.listaCompromisoEntidades.set(copyEntidades); break;
        }
      }
    })
  }

  obtenerDepartamentosServiceLista(i:number, control:string){
    let copyDepartamentos:any = []
    switch (control.toLowerCase()) {
      case 'integrantes': copyDepartamentos = [...this.listaIntegranteDepartamentos()]; break;
      case 'compromisos': copyDepartamentos = [...this.listaCompromisoDepartamentos()]; break;
    }

    this.ubigeoService.getDepartments().subscribe(resp => {
      if(resp.success){
        copyDepartamentos[i] = resp.data
        switch (control.toLowerCase()) {
          case 'integrantes': this.listaIntegranteDepartamentos.set(copyDepartamentos); break;
          case 'compromisos': this.listaCompromisoDepartamentos.set(copyDepartamentos); break;
        }
      }
    })
  }

  changeDepartamentoIntegrante(i:number, control:string){
    const getControl = this.formAtencion.get(control) as FormArray
    const entidadIdControl = getControl.at(i).get('entidadId')
    const departamento = getControl.at(i).get('departamento')?.value
    const provinciaControl = getControl.at(i).get('provincia')
    const distritoControl = getControl.at(i).get('distrito')
    const esRegionalControl = getControl.at(i).get('esRegional')
    const esRegional = esRegionalControl?.value

    if(departamento){
      const ubigeo = `${departamento}0000`
      if(esRegional){
        provinciaControl?.disable()
        provinciaControl?.reset()      
      } else {
        provinciaControl?.enable()        
        this.obtenerProvinciasServiceLista(i,control,departamento)
      }
      this.obtenerEntidadServiceLista(i,control,ubigeo)
    } else {
      provinciaControl?.disable()
      provinciaControl?.reset()
      entidadIdControl?.reset()
    }
    distritoControl?.disable()
    distritoControl?.reset()
  }

  obtenerProvinciasServiceLista(i:number,control:string,departamento:string){
    let copyProvincias:any = []
    switch (control.toLowerCase()) {
      case 'integrantes': copyProvincias = [...this.listaIntegranteProvincias()]; break;
      case 'compromisos': copyProvincias = [...this.listaCompromisoProvincias()]; break;
    }
    this.ubigeoService.getProvinces(departamento).subscribe(resp => {
      if(resp.success){
        copyProvincias[i] = resp.data
        switch (control.toLowerCase()) {
          case 'integrantes': this.listaIntegranteProvincias.set(copyProvincias); break;
          case 'compromisos': this.listaCompromisoProvincias.set(copyProvincias); break;
        }
      }
    })
  }

  changeProvinciaIntegrante(i:number,control:string){
    const getControl = this.formAtencion.get(control) as FormArray

    const departamentControl = getControl.at(i).get('departamento')
    const departamento = departamentControl?.value
    const provinciaControl = getControl.at(i).get('provincia')
    const provincia = provinciaControl?.value
    const distritoControl = getControl.at(i).get('distrito')

    let ubigeo = `${departamento}0000`
    if(provincia){
      ubigeo = provincia
      distritoControl?.enable()
      this.obtenerDistritosServiceLista(i,control,provincia)
    } else {
      distritoControl?.disable()
      distritoControl?.reset()
    }
    this.obtenerEntidadServiceLista(i,control,ubigeo)
  }

  obtenerDistritosServiceLista(i: number,control:string,provincia: string){
    let copyDistritos:any = []
    switch (control.toLowerCase()) {
      case 'integrantes': copyDistritos = [...this.listaIntegranteDistritos()]; break;
      case 'compromisos': copyDistritos = [...this.listaCompromisoDistritos()]; break;
    }
    this.ubigeoService.getDistricts(provincia)
      .subscribe( resp => {
        if(resp.success){
          copyDistritos[i] = resp.data
          switch (control.toLowerCase()) {
          case 'integrantes': this.listaIntegranteDistritos.set(copyDistritos); break;
          case 'compromisos': this.listaCompromisoDistritos.set(copyDistritos); break;
        }
        }
      })
  }

  changeDistritoIntegrante(i:number,control:string){
    const getControl = this.formAtencion.get(control) as FormArray

    const provinciaControl = getControl.at(i).get('provincia')
    const provincia = provinciaControl?.value
    const distritoControl = getControl.at(i).get('distrito')
    const distrito = distritoControl?.value

    const ubigeo = distrito ? distrito : provincia
    this.obtenerEntidadServiceLista(i,control,ubigeo)
  }

  obtenerEntidadServiceLista(i:number, control:string, ubigeo:string){
    const getControl = this.formAtencion.get(control) as FormArray

    const loadingEntidadControl = getControl.at(i).get('loadingEntidad')
    const entidadIdControl = getControl.at(i).get('entidadId')
    const entidadControl = getControl.at(i).get('entidad')
    const pagination:Pagination = { tipo: '2', ubigeo }
    loadingEntidadControl?.setValue(true)
    this.entidadService.obtenerEntidad(pagination).subscribe( resp => {
      loadingEntidadControl?.setValue(false)
      entidadIdControl?.setValue(resp.data ? resp.data.entidadId : null)
      entidadControl?.setValue(resp.data ? resp.data.nombre : null)
    })
  }

  changeDniList(i:number, control:string){
    const getControl = this.formAtencion.get(control) as FormArray

    const asistenteIdControl = getControl.at(i).get('asistenteId')
    const dniControl = getControl.at(i).get('dni')
    const nombreControl = getControl.at(i).get('nombre')
    const cargoControl = getControl.at(i).get('cargo')
    const telefonoControl = getControl.at(i).get('telefono')
    const emailControl = getControl.at(i).get('email')

    const dni = dniControl?.value
    dni > 0 ? dniControl?.setValidators([Validators.pattern(this.validatorService.DNIPattern)]) : dniControl?.clearValidators()
    dniControl?.updateValueAndValidity();

    if(dni.length == 8){
      this.obtenerAsistenteService(dni, control, i)
    } else {
      asistenteIdControl?.setValue(null)
      nombreControl?.setValue(null)
      cargoControl?.setValue(null)
      telefonoControl?.setValue(null)
      emailControl?.setValue(null)
    }

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

  generalValidate():boolean {
    const tipoControl = this.formControlValidate(this.formAtencion.get('tipo')!)
    const fechaAtencionControl = this.formControlValidate(this.formAtencion.get('fechaAtencion')!)
    const modalidadControl = this.formControlValidate(this.formAtencion.get('modalidad')!)
    const lugarIdControl = this.formControlValidate(this.formAtencion.get('lugarId')!)
    const tipoEntidadIdControl = this.formControlValidate(this.formAtencion.get('tipoEntidadId')!)
    const departamentoControl = this.formControlValidate(this.formAtencion.get('departamento')!)
    const provinciaControl = this.formControlValidate(this.formAtencion.get('provincia')!)
    const distritoControl = this.formControlValidate(this.formAtencion.get('distrito')!)
    const entidadIdControl = this.formControlValidate(this.formAtencion.get('entidadId')!)
    const autoridadControl = this.formControlValidate(this.formAtencion.get('autoridad')!)
    const dniAutoridadControl = this.formControlValidate(this.formAtencion.get('dniAutoridad')!)
    const nombreAutoridadControl = this.formControlValidate(this.formAtencion.get('nombreAutoridad')!)
    const cargoAutoridadControl = this.formControlValidate(this.formAtencion.get('cargoAutoridad')!)
    const espacioIdControl = this.formControlValidate(this.formAtencion.get('espacioId')!)
    const clasificacionControl = this.formControlValidate(this.formAtencion.get('clasificacion')!)
    const temaControl = this.formControlValidate(this.formAtencion.get('tema')!)



    return tipoControl && fechaAtencionControl && modalidadControl && lugarIdControl && tipoEntidadIdControl &&
      entidadIdControl && autoridadControl && espacioIdControl && clasificacionControl && temaControl
  }

  formControlValidate(control:AbstractControl ){
      let valid = true
      if(!control?.valid){
        control?.markAsTouched()
        valid = false
      }
      return valid
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
              cui: [data.cui, Validators.required],
              inversion: ['']
            })
            this.agendas.push(agendaRow)            
          }
        }
      })
  }

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

    const departamentoNombreControl = this.formAtencion.get('departamentoNombre')
    const departamento = this.formAtencion.get('departamento')
    const provinciaNombreControl = this.formAtencion.get('provinciaNombre')
    const provinciaControl = this.formAtencion.get('provincia')
    const distritoNombreControl = this.formAtencion.get('distritoNombre')
    const distritoControl = this.formAtencion.get('distrito')
    const autoridadControl = this.formAtencion.get('autoridad')
    const entidadControl = this.formAtencion.get('entidad')
    const entidadIdControl = this.formAtencion.get('entidadId')
    if(this.esMancomunidad){
      this.obtenerMancomunidadesService(tipo!.abreviatura)
    }

    distritoControl?.disable()
    distritoControl?.reset()
    provinciaControl?.disable()
    provinciaControl?.reset()
    departamento?.reset()
    
    distritoNombreControl?.reset()
    distritoNombreControl?.disable()
    provinciaNombreControl?.reset()
    provinciaNombreControl?.disable()
    departamentoNombreControl?.reset()
    departamentoNombreControl?.disable()

    entidadControl?.reset()
    entidadIdControl?.reset()
    autoridadControl?.reset()
    autoridadControl?.disable()
  }

  obtenerTipoEntidad(tipoId: number){
    return this.tipoEntidades().find(item => Number(item.tipoId!) == tipoId)
  }

  changeDepartamento(){    
    const tipoEntidadControl = this.formAtencion.get('tipoEntidadId')
    const ubigeoControl = this.formAtencion.get('ubigeo')
    const autoridadControl = this.formAtencion.get('autoridad')
    const departamentoValue = this.formAtencion.get('departamento')?.value
    const provinciaControl = this.formAtencion.get('provincia')
    const distritoControl = this.formAtencion.get('distrito')
    let ubigeo = null

    autoridadControl?.reset()

    distritoControl?.disable()
    distritoControl?.reset()
    provinciaControl?.reset()

    this.esRegional ? provinciaControl?.disable() : provinciaControl?.enable()
    departamentoValue ? autoridadControl?.enable() : autoridadControl?.disable()

    if(departamentoValue){
      ubigeo = `${departamentoValue}0000`
      if(!this.esRegional){
        this.obtenerProvinciasService(departamentoValue)
      }
      
      this.obtenerEntidadPorUbigeoService(ubigeo)
    }

    if(this.evento().verificaAsistentes){
      provinciaControl?.disable()
    }
  }

  obtenerProvinciasService(departamento: string) {
    this.ubigeoService.getProvinces(departamento).subscribe(resp => this.provincias.set(resp.data))
  }

  changeProvincia(){
    const departamento = this.formAtencion.get('departamento')?.value
    const provincia = this.formAtencion.get('provincia')?.value
    const distritoControl = this.formAtencion.get('distrito')
    const autoridadControl = this.formAtencion.get('autoridad')
    
    let ubigeo = `${departamento}0000`
    if(provincia && !this.esRegional){
      ubigeo = provincia
      
      distritoControl?.enable()
      this.obtenerDistritosService(ubigeo)
    } else {
      distritoControl?.disable()
    }

    if(this.evento().verificaAsistentes){
      distritoControl?.disable()
    }
    distritoControl?.reset()
    autoridadControl?.reset()
    this.obtenerEntidadPorUbigeoService(ubigeo)
  }

  obtenerDistritosService(provincia: string) {
    this.ubigeoService.getDistricts(provincia).subscribe(resp => this.distritos.set(resp.data))
  }

  changeDistrito(){
    const provincia = this.formAtencion.get('provincia')?.value
    const distrito = this.formAtencion.get('distrito')?.value   
    const autoridadControl = this.formAtencion.get('autoridad')

    const ubigeo = distrito && !this.esRegional ? distrito : provincia
    this.formAtencion.get('ubigeo')?.setValue(ubigeo)
    autoridadControl?.reset()
    this.obtenerEntidadPorUbigeoService(ubigeo) 
  }

  obtenerMancomunidadesService(mancomunidad: string) {
    this.paginationEntidad.subTipos = [mancomunidad]
    this.paginationEntidad.pageSize = 250
    delete this.paginationEntidad.entidadId
    delete this.paginationEntidad.tipo
    delete this.paginationEntidad.ubigeo
    this.obtenerEntidadService('MANCOMUNIDAD')
  }

  obtenerEntidadService(tipo:string){
    this.entidadService.listarEntidades(this.paginationEntidad)
      .subscribe( resp => {
        switch (tipo.toUpperCase()) {
          case 'MANCOMUNIDAD':
            this.mancomunidades.set(resp.data)
          break;
          case 'ENTIDAD':
            this.entidadPorUbigeo(resp.data[0])
          break;
        }
      })
  }

  obtenerEntidadPorUbigeoService(ubigeo: string) {
    if (ubigeo) {    
      let tipo = this.esMancomunidad ? '3' : '2'

      delete this.paginationEntidad.entidadId
      delete this.paginationEntidad.subTipos
      this.paginationEntidad.pageSize = 10
      this.paginationEntidad.ubigeo = ubigeo
      this.paginationEntidad.tipo = tipo
      this.obtenerEntidadService('ENTIDAD')
    }
  }

  entidadPorUbigeo(entidad: EntidadResponse){
    this.entidad.set(entidad)    
    this.formAtencion.get('entidad')?.setValue(entidad ? `${entidad.entidadTipoSlug}` : null)
    this.formAtencion.get('entidadId')?.setValue(entidad ? entidad.entidadId : null)
    if(!this.permisosPCM){
      const nivelGobierno = entidad.nivelGobierno ?? null
      const tipoEntidad = this.tipoEntidades().find(item => item.abreviatura.toUpperCase() === nivelGobierno)
      if(this.evento().verificaAsistentes){
        this.formAtencion.get('tipoEntidadId')?.setValue(tipoEntidad?.tipoId ?? null)
      }
    }
    if(this.esMancomunidad){      
      this.formAtencion.get('departamento')?.setValue(`${entidad.ubigeo.substring(0,2)}`)
      this.formAtencion.get('departamentoNombre')?.setValue(entidad.departamento)
      this.formAtencion.get('provinciaNombre')?.setValue(entidad.provincia)
      this.formAtencion.get('distritoNombre')?.setValue(entidad.distrito)
    }
    if(this.evento().verificaAsistentes){
      this.asignarEntidadUbigeo(entidad)      
    }
  }

  asignarEntidadUbigeo(entidad: EntidadResponse){
    const tiposValidos:string[] = ['MP','MD']
    const entidadTipo = tiposValidos.includes(entidad.entidadTipo!.toUpperCase()) ? 'GL' : entidad.entidadTipo!.toUpperCase()
    const tipoEntidad = this.tipoEntidades().find(tipo => tipo.abreviatura.toUpperCase() === entidadTipo)
    this.formAtencion.get('tipoEntidadId')?.setValue(tipoEntidad?.tipoId ?? null)
    this.formUbigeoAtencion(entidad.ubigeo, entidadTipo)
  }

  changeMancomunidad(){
    const mancomunidadValue = this.formAtencion.get('entidadId')?.value
    const autoridadControl = this.formAtencion.get('autoridad')

    autoridadControl?.reset()
    if(mancomunidadValue){
      this.paginationEntidad.entidadId = mancomunidadValue
      this.paginationEntidad.pageSize = 10
      delete this.paginationEntidad.subTipos
      this.obtenerEntidadService('ENTIDAD')
      autoridadControl?.enable()
    } else {
      autoridadControl?.enable()
      this.entidad.set({} as EntidadResponse)
    }
  }

  changeAutoridad(){
    const autoridadValue = this.formAtencion.get('autoridad')?.value
    const entidadIdValue = this.formAtencion.get('entidadId')?.value
    const dniControl = this.formAtencion.get('dniAutoridad')
    const nombreControl = this.formAtencion.get('nombreAutoridad')
    const cargoControl = this.formAtencion.get('cargoAutoridad')
    const contactoControl = this.formAtencion.get('contactoAutoridad')

    if(autoridadValue === true){
      if(!this.evento().verificaAsistentes){
        dniControl?.disable()
      }
      nombreControl?.disable()
      cargoControl?.disable()
      contactoControl?.disable()
      if(entidadIdValue && !this.evento().verificaAsistentes){
        this.asignarAutoridad()
      }
    }

    if(autoridadValue === false) {
      if(!this.evento().verificaAsistentes){
        dniControl?.reset()
        nombreControl?.reset()
        cargoControl?.reset()
        contactoControl?.reset()
      }

      dniControl?.enable()
      this.evento().verificaAsistentes ? nombreControl?.disable() : nombreControl?.enable()
      this.evento().verificaAsistentes ? cargoControl?.disable() : cargoControl?.enable()
      this.evento().verificaAsistentes ? contactoControl?.disable() : contactoControl?.enable()
    }

    if(autoridadValue === null) {
      dniControl?.reset()
      if(!this.evento().verificaAsistentes){
        dniControl?.disable()
      }
      nombreControl?.reset()
      nombreControl?.disable()
      cargoControl?.reset()
      cargoControl?.disable()
      contactoControl?.reset()
      contactoControl?.disable()
    }
  }

  changeDocumentoAutoridad(){
    const dniControl = this.formAtencion.get('dniAutoridad')
    const dniValue = dniControl?.value

    dniValue.length > 0 
    ? dniControl?.setValidators([Validators.pattern(this.validatorService.DNIPattern)])
    : dniControl?.setValidators( this.permisosPCM ? null : [Validators.required])

    dniControl?.updateValueAndValidity();

    if(dniValue.length == 8){
      this.obtenerAsistenteService(dniValue)
    } else {
      this.formAtencion.get('nombreAutoridad')!.setValue(null)
      this.formAtencion.get('cargoAutoridad')!.setValue(null)
      this.formAtencion.get('contactoAutoridad')!.setValue(null)

      this.evento().verificaAsistentes ? this.formAtencion.get('nombreAutoridad')!.disable() : this.formAtencion.get('nombreAutoridad')!.enable()
      this.evento().verificaAsistentes ? this.formAtencion.get('cargoAutoridad')!.disable() : this.formAtencion.get('cargoAutoridad')!.enable()
      this.evento().verificaAsistentes ? this.formAtencion.get('contactoAutoridad')!.disable() : this.formAtencion.get('contactoAutoridad')!.enable()
    }
  }

  obtenerAsistenteService(dni: string, control:string = '', i:number = 0){
    const eventoId = this.evento().verificaAsistentes ? Number(this.evento().eventoId!) : 0

    if(control === ''){
      this.loadingAutoridad = true
    } else {
      const getControl = this.formAtencion.get(control) as FormArray
      getControl.at(i).get('loadingAsistente')?.setValue(true)
    }
    this.atencionService.obtenerAsistente(dni, eventoId)
      .subscribe( resp => {
        this.loadingAutoridad = false
        const asistente = resp.data
        if(asistente){
          control === '' ? this.setAsistenteFormulario(asistente) : this.setAsistenteFormularioLista(asistente,control,i)
        } else {
          if(control === ''){
            this.formAtencion.get('asistenteId')?.setValue(null)
            this.evento().verificaAsistentes ? this.formAtencion.get('nombreAutoridad')?.disable() : this.formAtencion.get('nombreAutoridad')?.enable()
            this.evento().verificaAsistentes ? this.formAtencion.get('cargoAutoridad')?.disable() : this.formAtencion.get('cargoAutoridad')?.enable()
            this.evento().verificaAsistentes ? this.formAtencion.get('contactoAutoridad')?.disable() : this.formAtencion.get('contactoAutoridad')?.enable()
            this.formAtencion.get('nombreAutoridad')?.setValue(null)
            this.formAtencion.get('cargoAutoridad')?.setValue(null)
            this.formAtencion.get('contactoAutoridad')?.setValue(null)
            if(this.evento().verificaAsistentes){
              this.formAtencion.get('dniAutoridad')?.setErrors({ msgBack: 'Aún no asiste al evento' });
            } 
          }
        }
      })
  }

  setAsistenteFormulario(asistente: AsistenteAtencionResponse){
    let contacto = asistente.telefono
    if(asistente.telefono && asistente.telefono != '' && asistente.email && asistente.email != ''){
      contacto = `${asistente.telefono} / ${asistente.email}`
    }

    this.formAtencion.get('asistenteId')?.setValue(asistente.asistenteId)
    this.formAtencion.get('nombreAutoridad')?.setValue(asistente.nombres)
    this.formAtencion.get('cargoAutoridad')?.setValue(asistente.cargo)
    this.formAtencion.get('contactoAutoridad')?.setValue(contacto )
    this.formAtencion.get('nombreAutoridad')?.disable()
    this.formAtencion.get('cargoAutoridad')?.disable()
    this.formAtencion.get('contactoAutoridad')?.disable()
    if(this.evento().verificaAsistentes){
        const esAutoridad = asistente.cargo.toLowerCase().includes('alcalde') || asistente.cargo.toLowerCase().includes('gobernador')
        this.formAtencion.get('autoridad')?.setValue(esAutoridad)
        this.formAtencion.get('entidadId')?.setValue(asistente.entidadId)
        this.paginationEntidad.entidadId = asistente.entidadId
        this.paginationEntidad.pageSize = 10
        delete this.paginationEntidad.subTipos
        this.obtenerEntidadService('ENTIDAD')
    }
  }

  setAsistenteFormularioLista(asistente: AsistenteAtencionResponse, control:string, i:number){
    const getControl = this.formAtencion.get(control) as FormArray
    getControl.at(i).get('loadingAsistente')?.setValue(false)
    getControl.at(i).get('asistenteId')?.setValue(asistente.asistenteId)
    getControl.at(i).get('nombres')?.disable()
    getControl.at(i).get('nombres')?.setValue(asistente.nombres)
    getControl.at(i).get('cargo')?.disable()
    getControl.at(i).get('cargo')?.setValue(asistente.cargo)
    getControl.at(i).get('telefono')?.setValue(asistente.telefono)
    getControl.at(i).get('email')?.setValue(asistente.email)
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

  asignarAutoridad(){
    this.loadingAutoridad = true
    setTimeout(() => {
      this.loadingAutoridad = false
      this.formAtencion.get('dniAutoridad')?.setValue(this.entidad().dniAutoridad)
      this.formAtencion.get('nombreAutoridad')?.setValue(`${this.entidad().nombreAutoridad} ${this.entidad().apellidosAutoridad}` )

      const cargoAutoridad = this.create ? this.entidad().cargoAutoridad : this.atencion.cargoAutoridad
      const telefonoAutoridad = this.create ? this.entidad().telefonoAutoridad : this.atencion.contactoAutoridad
      this.formAtencion.get('cargoAutoridad')?.setValue(cargoAutoridad)
      this.formAtencion.get('contactoAutoridad')?.setValue(telefonoAutoridad)
      if(this.esMancomunidad && !cargoAutoridad){
        this.formAtencion.get('cargoAutoridad')?.enable()
      }
    }, 1500);
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
    if (formGroup == 'integrantes') {
      this.addIntegranteRow()
    }
    if (formGroup == 'compromisos') {
      this.addCompromisoRow()
    }
  }
  
  addAgendadRow() {    
    const agendaRow = this.fb.group({
      agendaId: [],
      clasificacionId: [null, Validators.required],
      cui: ['', [Validators.required]],
      inversion: [''],
      nombre: [''],
      loading: [false],
      visible: [false],
      costoActualizado: ['']
    })
    this.agendas.push(agendaRow)
  }

  addIntegranteRow(){
    const integranteRow = this.fb.group({
      integranteId: [''],
      nivelGobiernoId: [null, Validators.required],
      tipo: [''],
      sectorId: [''],
      esRegional: [''],
      departamento: [''],
      provincia: [''],
      distrito: [''],
      loadingEntidad: [false],
      entidadId: [null, Validators.required],
      entidad: [{ value: null, disabled: true }],
      entidadSlug: [{ value: null, disabled: true }],
      asistenteId: [null],
      dni: [''],
      nombres: [null, Validators.required],
      cargo: [null, Validators.required],
      telefono: [null, Validators.required],
      email: [null, Validators.required]
    })
    this.integrantes.push(integranteRow)    
    this.listaIntegranteSectores.update(sectores => [...sectores, []])
    this.listaIntegranteEntidades.update(entidades => [...entidades, []])
    this.listaIntegranteDepartamentos.update(departamentos => [...departamentos, []])
    this.listaIntegranteProvincias.update(provincias => [...provincias, []])
    this.listaIntegranteDistritos.update(distritos => [...distritos, []])
  }

  addCompromisoRow(){
    const compromisoRow = this.fb.group({
      compromisoId: [''],
      nivelGobiernoId: [null, Validators.required],
      tipo: [''],
      sectorId: [''],
      esRegional: [''],
      departamento: [''],
      provincia: [''],
      distrito: [''],
      loadingEntidad: [false],
      entidadId: [null, Validators.required],
      entidad: [{ value: null, disabled: true }],
      entidadSlug: [{ value: null, disabled: true }],
      plazo: [null, Validators.required],
      compromiso: [null, Validators.required]
    })
    this.compromisos.push(compromisoRow)  
    this.listaCompromisoSectores.update(sectores => [...sectores, []])
    this.listaCompromisoEntidades.update(entidades => [...entidades, []])
    this.listaCompromisoDepartamentos.update(departamentos => [...departamentos, []])
    this.listaCompromisoProvincias.update(provincias => [...provincias, []])
    this.listaCompromisoDistritos.update(distritos => [...distritos, []]) 
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
    } else if (formGroup == 'integrantes') {
      this.removeIntegranteRow(i)
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
    } else if (formGroup == 'compromisos') {
      this.removeCompromisoRow(i)
    }
  }

  removeIntegranteRow(i:number){
    if (!this.create) {
      const integrantes = this.formAtencion.get('integrantes') as FormArray
      const integrantesId = integrantes.at(i).get('integranteId')?.value
      // this.asistenciaTecnicaParticipanteService.eliminarParticipante(integrantesId)
      //   .subscribe(resp => {
      //     if (resp.success == true) {
      //       this.participantes.removeAt(i)
      //     }
      //   })
    } else {
      this.integrantes.removeAt(i)
    }
  }

  removeCompromisoRow(i:number){
    if (!this.create) {
      const compromisos = this.formAtencion.get('compromisos') as FormArray
      const compromisoId = compromisos.at(i).get('compromisoId')?.value
      // this.asistenciaTecnicaParticipanteService.eliminarParticipante(integrantesId)
      //   .subscribe(resp => {
      //     if (resp.success == true) {
      //       this.participantes.removeAt(i)
      //     }
      //   })
    } else {
      this.compromisos.removeAt(i)
    }
  }

  obtenerInversionSsi(index: number) {
    const agendas = this.formAtencion.get('agendas') as FormArray
    const cui = agendas.at(index).get('cui')
    const loadingControl = agendas.at(index).get('loading')
    const visibleControl = agendas.at(index).get('visible')
    const nombreControl = agendas.at(index).get('nombre')
    const costoActualizado = agendas.at(index).get('costoActualizado')
    let value = cui?.value
    if (value.length > 7) {
      const newValue = value.substring(0, 7);
      cui?.setValue(newValue)
    }

    loadingControl?.setValue(false)
    visibleControl?.setValue(false)
    nombreControl?.setValue(null)
    costoActualizado?.setValue(null)
  }

  obtenerInversionEncontrada(i: number): SSInversionTooltip {
    const agendas = this.formAtencion.get('agendas') as FormArray
    const loading = agendas.at(i).get('loading')?.value
    const visible = agendas.at(i).get('visible')?.value
    const nombre = agendas.at(i).get('nombre')?.value
    const costoActualizado = agendas.at(i).get('costoActualizado')?.value
    return { loading, visible, nombre, costoActualizado }
  }

  changeFiles(dataFile: DataFile, control: string) {
    const controlForm = this.formAtencion.get(control)
    if (dataFile.exist) {
      this.reNewFile = false
      controlForm?.setValue(dataFile.file!)

      const reader = new FileReader()
      reader.readAsDataURL(dataFile.file!)
    } else {
      controlForm?.reset()
    }
  }

  changeTipoInversion(){
    const orientacionId = this.formAtencion.get('orientacionId')?.value

    if(orientacionId){
      const orientacion = this.orientaciones.find(item => item.orientacionId == orientacionId)
      const codigoOrientacion: string[] = ['PROYECTO','IDEA']
      this.cuiClasificacion = codigoOrientacion.includes(orientacion!.nombre.toUpperCase())  
      const getControl = this.formAtencion.get('agendas') as FormArray
      

      if(this.agendas.length > 0 && this.create){
        this.agendas.clear()
      }
      
      if(this.cuiClasificacion){
        if(this.agendas.length == 0){
          this.addAgendadRow() 
        }

        const clasificacion = this.agendaClasificaciones().find(item => item.nombre.toUpperCase() == 'PROYECTO')
        const clasificacionId = clasificacion ? clasificacion.clasificacionId : this.agendaClasificaciones()[0].clasificacionId

        const clasificacionControl = getControl.at(0).get('clasificacionId')
        clasificacionControl?.setValue(clasificacionId)
        const cuiControl = getControl.at(0).get('cui')
        const nombreOrientacion = orientacion!.nombre.toUpperCase()
        switch (nombreOrientacion) {
          case codigoOrientacion[0]: cuiControl?.setValidators([Validators.required, Validators.pattern(this.validatorService.sevenNumberPattern)]); break;
          case codigoOrientacion[1]: cuiControl?.setValidators([Validators.required, Validators.pattern(this.validatorService.sixNumberPattern)]); break;
        }
      }
    }
  }

  verificarCuiClasificacion(){
    const orientacionId = this.formAtencion.get('orientacionId')?.value
    const orientacion = this.orientaciones.find(item => item.orientacionId == orientacionId)
    const codigoOrientacion: string[] = ['PROYECTO','IDEA']
    this.cuiClasificacion = orientacion ? codigoOrientacion.includes(orientacion!.nombre.toUpperCase()) : false
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
      } else if(control == 'acuerdos') {
        this.acuerdosCount = qty - value.length
      } else {
        this.comentariosCount = qty - value.length;
      }
    }
    
  }

}
