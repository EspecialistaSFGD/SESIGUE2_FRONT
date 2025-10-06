import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IntervencionEspacioOrigenEnum } from '@core/enums';
import { convertEnumToObject, obtenerUbigeoTipo, typeErrorControl } from '@core/helpers';
import { DataModalIntervencion, EntidadResponse, EventoResponse, IntervencionEspacioOriginResponse, IntervencionEspacioResponse, IntervencionEspacioSubTipo, IntervencionEspacioTipo, IntervencionEtapaResponse, IntervencionFaseResponse, IntervencionHitoResponse, ItemEnum, Pagination, SectorResponse, TipoEventoResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { AcuerdosService, EntidadesService, EventosService, IntervencionEspacioService, IntervencionEtapaService, IntervencionFaseService, IntervencionHitoService, IntervencionService, SectoresService, TipoEventosService, UbigeosService } from '@core/services';
import { ValidatorService } from '@core/services/validators';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { ProgressSpinerComponent } from '@shared/progress-spiner/progress-spiner.component';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-formulario-intervencion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNgModule, NgZorroModule, ProgressSpinerComponent],
  providers: [MessageService],
  templateUrl: './formulario-intervencion.component.html',
  styles: ``
})
export class FormularioIntervencionComponent {
  readonly dataIntervencionTarea: DataModalIntervencion = inject(NZ_MODAL_DATA);

  loadingInteraccion: boolean = false
  create: boolean = this.dataIntervencionTarea.create
  // origen: IntervencionEspacioOriginResponse = this.dataIntervencionTarea.origen
  intervencionEspacio: IntervencionEspacioResponse = this.dataIntervencionTarea.intervencionEspacio
  sectoresValidos: number[] = this.dataIntervencionTarea.sectores
  ubigeosValidos: string[] = this.dataIntervencionTarea.ubigeos

  esAcuerdo: boolean = false
  esMesa: boolean = false
  private timeout: any;

  pagination: Pagination = {
    columnSort: 'nombre',
    typeSort: 'ASC',
    pageSize: 100,
    currentPage: 1
  }

  labeldescripcion:string = 'Descripción'

  origenes: ItemEnum[] = convertEnumToObject(IntervencionEspacioOrigenEnum)

  intervencionTipos: IntervencionEspacioTipo[] = [
    { tipoId: '1', tipo: 'PROYECTO' },
    { tipoId: '2', tipo: 'ACTIVIDAD' }
  ]

  subTipos: IntervencionEspacioSubTipo[] = [
    { subTipoId: '1', subTipo: 'CUI', tipoId: '1' },
    { subTipoId: '2', subTipo: 'IDEA', tipoId: '1' },
    { subTipoId: '3', subTipo: 'RCC', tipoId: '1' },
    { subTipoId: '4', subTipo: 'ACTIVIDAD', tipoId: '2' },
  ]

  intervencionSubTipos = signal<IntervencionEspacioSubTipo[]>([])

  tiposEventos = signal<TipoEventoResponse[]>([])
  sectores = signal<SectorResponse[]>([])
  sectorEntidades = signal<EntidadResponse[]>([])
  evento: EventoResponse = {} as EventoResponse
  eventos = signal<EventoResponse[]>([])
  departamentos = signal<UbigeoDepartmentResponse[]>([])
  provincias = signal<UbigeoProvinciaResponse[]>([])
  distritos = signal<UbigeoDistritoResponse[]>([])
  fasesInicial = signal<IntervencionFaseResponse[]>([])
  etapasInicial = signal<IntervencionEtapaResponse[]>([])
  hitosInicial = signal<IntervencionHitoResponse[]>([])
  fasesObjetivo = signal<IntervencionFaseResponse[]>([])
  etapasObjetivo = signal<IntervencionEtapaResponse[]>([])
  hitosObjetivo = signal<IntervencionHitoResponse[]>([])

  private fb = inject(FormBuilder)
  private sectorService = inject(SectoresService)
  private entidadService = inject(EntidadesService)
  private ubigeoService = inject(UbigeosService)
  private intervencionFaseService = inject(IntervencionFaseService)
  private intervencionEtapaService = inject(IntervencionEtapaService)
  private intervencionHitoService = inject(IntervencionHitoService)
  private tiposEventosService = inject(TipoEventosService)
  private eventosService = inject(EventosService)
  private validatorsService = inject(ValidatorService)
  private acuerdoService = inject(AcuerdosService)
  private intervencionService = inject(IntervencionService)
  private intervencionEspacioService = inject(IntervencionEspacioService)
  private messageService = inject(MessageService)

  formIntervencionEspacio: FormGroup = this.fb.group({
    intervencionId: [ { value: 0, disabled: true }, Validators.required ],
    origen: [ { value: '', disabled: true }, Validators.required ],
    tipoEventoId: [ { value: '', disabled: true }, Validators.required ],
    evento: [{ value: '', disabled: true }],
    eventoId: [ { value: '', disabled: true }, Validators.required],
    tipoIntervencion: [ '', Validators.required ],
    subTipoIntervencion: [ { value: '', disabled: true }, Validators.required ],
    codigoIntervencion: [ { value: '', disabled: true }, Validators.required ],
    sectorId: [ '', Validators.required ],
    entidadSectorId: [ { value: '', disabled: true }, Validators.required ],
    descripcion: [{ value: '', disabled: true }],
    departamento: ['', Validators.required ],
    provincia: [{ value: '', disabled: true }],
    distrito: [{ value: '', disabled: true }],
    entidadUbigeoId: [ '', Validators.required ],
    interaccionId: [ '', Validators.required ],
    codigoAcuerdo: [''],
    pedido: [{ value: '', disabled: true }],
    acuerdo: [{ value: '', disabled: true }],
    interaccion: [{ value: '', disabled: true }],
    inicioIntervencionFaseId: [ { value: '', disabled: true }, Validators.required ],
    inicioIntervencionEtapaId: [ { value: '', disabled: true }, Validators.required ],
    inicioIntervencionHitoId: [ { value: '', disabled: true }, Validators.required ],
    objetivoIntervencionFaseId: [ { value: '', disabled: true }, Validators.required ],
    objetivoIntervencionEtapaId: [ { value: '', disabled: true }, Validators.required ],
    objetivoIntervencionHitoId: [ { value: '', disabled: true }, Validators.required ],
  })

  ngOnInit(): void {    
    this.esAcuerdo = Number(this.intervencionEspacio.origen) == 0
    this.esMesa = Number(this.intervencionEspacio.origen) == 1
    
    const eventoId = this.intervencionEspacio.eventoId ? parseInt(this.intervencionEspacio.eventoId) : null
    
    this.formIntervencionEspacio.reset({...this.intervencionEspacio, eventoId})

    this.setFormValues()

    this.obtenerTipoEventoServices()
    this.obtenerEventoServices()
    this.obtenerSectoresServices()
    this.obtenerDepartamentoServices()
  }

  setFormValues(){
    const tipoInverscionControl = this.formIntervencionEspacio.get('tipoIntervencion')    
    const subTipoIntervencionControl = this.formIntervencionEspacio.get('subTipoIntervencion')    
    this.esAcuerdo ? tipoInverscionControl?.disable() : tipoInverscionControl?.enable()
    if(this.esAcuerdo){ 
      
      this.obtenerTipo()
      // this.formIntervencionEspacio.get('subTipoIntervencion')?.setValue()
      this.formIntervencionEspacio.get('inicioIntervencionFaseId')?.setValue('0')
      this.formIntervencionEspacio.get('objetivoIntervencionFaseId')?.setValue('0')
      this.formIntervencionEspacio.get('codigoAcuerdo')?.setValidators([Validators.required]);
      // this.formIntervencionEspacio.get('codigoAcuerdo')?.updateValueAndValidity();
    }
  }

  alertMessageError(control: string) {
    return this.formIntervencionEspacio.get(control)?.errors && this.formIntervencionEspacio.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formIntervencionEspacio.get(control)?.errors;

    return typeErrorControl(text, errors)
  }

  obtenerTipoEventoServices(){
    const paginationTipoEvento: Pagination = { columnSort: 'codigoTipoEvento', typeSort: 'ASC', pageSize: 100, currentPage: 1 }
    this.tiposEventosService.getAllTipoEvento(paginationTipoEvento).subscribe( resp => this.tiposEventos.set(resp.data))
  }

  obtenerEventoServices(){
    const eventoIdControl = this.formIntervencionEspacio.get('eventoId')
    const eventoControl = this.formIntervencionEspacio.get('evento')
    const codigoAcuerdoControl = this.formIntervencionEspacio.get('codigoAcuerdo')
    this.eventosService.obtenerEvento(this.intervencionEspacio.eventoId).subscribe(resp => {
      if(resp.data){
        this.evento = resp.data
        eventoIdControl?.setValue(this.evento ? this.evento.eventoId! : null)
        eventoControl?.setValue(this.evento ? this.evento.abreviatura : null)
        codigoAcuerdoControl?.setValue(this.evento ? `${this.evento.abreviatura}-` : null)
      }
    })

  }

  obtenerSectoresServices(){
    const paginationSector: Pagination = { columnSort: 'grupoID', typeSort: 'ASC', pageSize: 50, currentPage: 1 }
    this.sectorService.listarSectores(paginationSector).subscribe( resp => this.sectores.set(this.sectoresValidos.length > 0 ? resp.data.filter( item => this.sectoresValidos.includes(Number(item.grupoID))) : resp.data))  
  }

  obtenerDepartamentoServices(){
    this.ubigeoService.getDepartments().subscribe( resp => this.departamentos.set(this.ubigeosValidos.length > 0 ? resp.data.filter( item => this.ubigeosValidos.includes(item.departamentoId)) : resp.data)) 
  }

  obtenerIntervencionFaseService(inicial: boolean, tipoIntervencion: number){
    this.intervencionFaseService.ListarIntervencionFases(this.pagination)
      .subscribe( resp => inicial ? this.fasesInicial.set(resp.data.filter(item => Number(item.tipoIntervencion) == tipoIntervencion )) : this.fasesObjetivo.set(resp.data.filter(item => Number(item.tipoIntervencion) == tipoIntervencion )) )
  }

  obtenerTipo(){
    const tipoValue = this.formIntervencionEspacio.get('tipoIntervencion')?.value
    const subTipoControl = this.formIntervencionEspacio.get('subTipoIntervencion')
    const codigoIntervencionControl = this.formIntervencionEspacio.get('codigoIntervencion')
    const descripcionControl = this.formIntervencionEspacio.get('descripcion')

    if(tipoValue){
      const intervencionTipos = this.intervencionTipos.find( item => item.tipoId == tipoValue)!
      this.labeldescripcion = intervencionTipos.tipo.toUpperCase() == 'PROYECTO' ? 'Nombre de proyecto' : 'Descripción de actividad ó acuerdo'
      
      const subTipos = this.subTipos.filter( item => item.tipoId == tipoValue)      
      this.intervencionSubTipos.set(subTipos)
      subTipoControl?.setValue(subTipos[0].subTipoId)
      this.setFasesdeTipo(tipoValue)
      this.obtenerSubTipo()
    } else {
      this.intervencionSubTipos.set([])
      codigoIntervencionControl?.disable()
      descripcionControl!.disable()
      subTipoControl?.reset()
      this.labeldescripcion = 'Descripción'
    }
    tipoValue ? subTipoControl?.enable() : subTipoControl?.disable()
    codigoIntervencionControl?.reset()
  }
  
  setFasesdeTipo(tipo: number){
    this.obtenerIntervencionFaseService(true,tipo)
    this.obtenerIntervencionFaseService(false,tipo)
    const controlFaseObjetivo = this.formIntervencionEspacio.get('inicioIntervencionFaseId')
    const controlEtapaObjetivo = this.formIntervencionEspacio.get('inicioIntervencionEtapaId')
    const controlHitoObjetivo = this.formIntervencionEspacio.get('inicioIntervencionHitoId')
    const controlFaseInicial = this.formIntervencionEspacio.get('objetivoIntervencionFaseId')
    const controlEtapaInicial = this.formIntervencionEspacio.get('objetivoIntervencionEtapaId')
    const controlHitoInicial = this.formIntervencionEspacio.get('objetivoIntervencionHitoId')
    
    controlFaseObjetivo?.enable()
    controlFaseObjetivo?.reset()
    controlEtapaObjetivo?.disable()
    controlEtapaObjetivo?.reset()
    controlHitoObjetivo?.disable()
    controlHitoObjetivo?.reset()

    controlFaseInicial?.enable()
    controlFaseInicial?.reset()
    controlEtapaInicial?.disable()
    controlEtapaInicial?.reset()
    controlHitoInicial?.disable()
    controlHitoInicial?.reset()

  }

  obtenerSubTipo(){
    const subTipoValue = this.formIntervencionEspacio.get('subTipoIntervencion')?.value
    const codigoIntervencionControl = this.formIntervencionEspacio.get('codigoIntervencion')
    const descripcionControl = this.formIntervencionEspacio.get('descripcion')
   
    if(subTipoValue){
      const subTipo: IntervencionEspacioSubTipo = this.subTipos.find( item => item.subTipoId == subTipoValue)!
      switch (subTipo.subTipo.toUpperCase()) {
        case 'CUI':
          codigoIntervencionControl?.enable() 
          codigoIntervencionControl?.setValidators([Validators.required, Validators.pattern(this.validatorsService.sevenNumberPattern)])
          descripcionControl?.clearValidators()
          descripcionControl?.disable()
        break;
        case 'IDEA':
          codigoIntervencionControl?.enable() 
          codigoIntervencionControl?.setValidators([Validators.required, Validators.pattern(this.validatorsService.sixNumberPattern)])
          descripcionControl?.setValidators([Validators.required])
          descripcionControl?.enable()
        break;
        case 'RCC':
          codigoIntervencionControl?.enable() 
          codigoIntervencionControl?.setValidators([Validators.required, Validators.pattern(this.validatorsService.sevenNumberPattern)])
          descripcionControl?.clearValidators()
          descripcionControl?.disable()
        break;
        case 'ACTIVIDAD':
          descripcionControl?.setValidators([Validators.required])
          codigoIntervencionControl?.clearValidators()
          codigoIntervencionControl?.disable()
          descripcionControl?.enable()
        break;
        // case 'ACTIVIDAD': codigoIntervencionControl?.setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(7), Validators.pattern(this.validatorsService.startFiveNumberPattern)]); break;
      }
      // this.setDisabledCodigoIntervencion()
    } else {
      codigoIntervencionControl?.clearValidators();
      descripcionControl?.clearValidators();
    }
    codigoIntervencionControl?.reset()
    descripcionControl?.reset()
    // subTipoValue ? codigoIntervencionControl?.enable() : codigoIntervencionControl?.disable()    
  }

  changeControl(event: any){
    const codigoAcuerdoControl = this.formIntervencionEspacio.get('codigoAcuerdo')
    const codigoAcuerdoValue = codigoAcuerdoControl?.value

    const slug = this.evento.abreviatura
    const startCodigo = `${slug}-`
    const cantidadSlug = startCodigo.length

    if(codigoAcuerdoValue.length <= cantidadSlug){
      codigoAcuerdoControl?.setValue(startCodigo)
      this.setvalueFormControl('pedido','')
      this.setvalueFormControl('acuerdo','')
      this.setvalueFormControl('codigoIntervencion','')
      this.setvalueFormControl('descripcion','')
      this.setvalueFormControl('sectorId','')
      this.setvalueFormControl('departamento','')
      this.setvalueFormControl('distrito','')
      this.setvalueFormControl('provincia','')
      this.disableFormControl('entidadSectorId',true)
      this.disableFormControl('distrito',true)
      this.disableFormControl('provincia',true)
      this.disableFormControl('descripcion',true)
      event.preventDefault();
      return;
    }

    if(codigoAcuerdoValue){
      clearTimeout(this.timeout);
      var $this = this;
      this.timeout = setTimeout(function () {
        if ($this.validatorsService.codigoPattern.test(event.key) || event.key === 'Backspace' || event.key === 'Delete' || codigoAcuerdoValue.length > cantidadSlug) {
          $this.obtenerCodigoAcuerdo()
        }
      }, 500);    
    }
  }

  obtenerCodigoAcuerdo(){
    const interaccionIdControl = this.formIntervencionEspacio.get('interaccionId')
    const codigoAcuerdoControl = this.formIntervencionEspacio.get('codigoAcuerdo')
    const pedidoControl = this.formIntervencionEspacio.get('pedido')
    const acuerdoControl = this.formIntervencionEspacio.get('acuerdo')
    const codigoIntervencionControl = this.formIntervencionEspacio.get('codigoIntervencion')
    const descripcionControl = this.formIntervencionEspacio.get('descripcion')
    const sectorIdControl = this.formIntervencionEspacio.get('sectorId')
    const codigoAcuerdo = codigoAcuerdoControl?.value    

    if(codigoAcuerdo && codigoAcuerdo.length > 0){
      this.loadingInteraccion = true
      // const codigo = `${this.evento.abreviatura}-${codigoAcuerdo}`
      const codigo = codigoAcuerdo
      this.acuerdoService.listarAcuerdos({ codigo, columnSort: 'acuerdoId', typeSort: 'ASC', currentPage: 1, pageSize: 1 })
        .subscribe( resp => {
          this.loadingInteraccion = false          
          if(resp.data.length > 0){
            const acuerdo = resp.data[0]            
            interaccionIdControl?.setValue(acuerdo.acuerdoID)
            acuerdoControl?.setValue(acuerdo.acuerdo)
            pedidoControl?.setValue(acuerdo.aspectoCriticoResolver)
            codigoIntervencionControl?.setValue(acuerdo.cuis ?? null)
            sectorIdControl?.setValue(acuerdo.sectorId ?? null)
            this.obtenerSector()
            this.setUbigeoForm(acuerdo.ubigeo)
            // descripcionControl?.setValue(null)
            // descripcionControl?.enable()
            acuerdo.cuis ? codigoIntervencionControl?.disable() : codigoIntervencionControl?.enable()
            if(acuerdo.cuis){
              // this.obtenerIntervencionService()
              this.verificarIntervencionEspacioService(acuerdo.cuis)
            } else {
              descripcionControl?.setValue(null)
              descripcionControl?.enable()
            }
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: "El acuerdo no existe" });
            // interaccionIdControl?.setValue(null)
            // pedidoControl?.setValue(null)
            // acuerdoControl?.setValue(null)
            // codigoIntervencionControl?.setValue(null)
            // codigoIntervencionControl?.enable()
            // descripcionControl?.setValue(null)
            // descripcionControl?.enable()
            this.setvalueFormControl('pedido','')
            this.setvalueFormControl('acuerdo','')
            this.setvalueFormControl('codigoIntervencion','')
            this.setvalueFormControl('descripcion','')
            this.setvalueFormControl('sectorId','')
            this.setvalueFormControl('departamento','')
            this.setvalueFormControl('distrito','')
            this.setvalueFormControl('provincia','')
            this.disableFormControl('entidadSectorId',true)
            this.disableFormControl('distrito',true)
            this.disableFormControl('provincia',true)
            this.disableFormControl('descripcion',true)
            // sectorIdControl?.reset()
          }          
        })
    }
  }

  setUbigeoForm(ubigeo:string){
    const departamentoControl = this.formIntervencionEspacio.get('departamento')
    const provinciaControl = this.formIntervencionEspacio.get('provincia')
    const distritoControl = this.formIntervencionEspacio.get('distrito')

    if(ubigeo){
      const tipoUbigeo = obtenerUbigeoTipo(ubigeo)
      departamentoControl?.setValue(tipoUbigeo.departamento)
      this.obtenerDepartamento()

      tipoUbigeo.provincia ? provinciaControl?.setValue(tipoUbigeo.provincia) : provinciaControl?.reset()
      if(tipoUbigeo.provincia){
        this.obtenerProvincia()
      }
      tipoUbigeo.distrito ? distritoControl?.setValue(tipoUbigeo.distrito) : distritoControl?.reset()
    }
  }

  changeCodigoIntervencion(event: any){
    const codigoIntervencionControl = this.formIntervencionEspacio.get('codigoIntervencion')
    const codigoIntervencionControlValue = codigoIntervencionControl?.value

    if(codigoIntervencionControlValue){
      clearTimeout(this.timeout);
      var $this = this;
      this.timeout = setTimeout(function () {
        if ($this.validatorsService.codigoPattern.test(event.key) || event.key === 'Backspace' || event.key === 'Delete' || codigoIntervencionControlValue.length > 0) {     
          // $this.obtenerIntervencionService()
          $this.verificarIntervencionEspacioService(codigoIntervencionControlValue)
        }
      }, 500);    
    }
  }

  verificarIntervencionEspacioService(cui: string){
    const origenId = this.intervencionEspacio.origen
    const pagination: Pagination = { cui, origenId, columnSort: 'intervencionEspacioId', typeSort: 'DESC', pageSize: 10, currentPage: 1 }
    this.intervencionEspacioService.ListarIntervencionEspacios(pagination)
      .subscribe( resp => {
        if(resp.data.length > 0){
          this.messageService.add({ severity: 'error', summary: 'Error', detail: `La intervencion con el codigo ${cui} ya existe` });
          this.setvalueFormControl('pedido','')
          this.setvalueFormControl('acuerdo','')
          this.setvalueFormControl('codigoIntervencion','')
          this.setvalueFormControl('descripcion','')
          this.setvalueFormControl('sectorId','')
          this.setvalueFormControl('departamento','')
          this.setvalueFormControl('distrito','')
          this.setvalueFormControl('provincia','')
          this.disableFormControl('entidadSectorId',true)
          this.disableFormControl('distrito',true)
          this.disableFormControl('provincia',true)
          this.disableFormControl('descripcion',true)
        } else {
          this.obtenerIntervencionService()
        }
      })
  }

  setvalueFormControl(control:string, value: string = ''){
    value == '' ? this.formIntervencionEspacio.get(control)?.reset() : this.formIntervencionEspacio.get(control)?.setValue(value)
  }

  disableFormControl(control:string, disable: boolean = false){
    disable ? this.formIntervencionEspacio.get(control)?.disable() : this.formIntervencionEspacio.get(control)?.enable()
  }

  obtenerIntervencionService(){
    const intervencionIdControl = this.formIntervencionEspacio.get('intervencionId')
    const codigoIntervencionControl = this.formIntervencionEspacio.get('codigoIntervencion')
    const descripcionControl = this.formIntervencionEspacio.get('descripcion')
    const cui = codigoIntervencionControl?.value

    const paginationIntervencion: Pagination = { cui, columnSort: 'intervencionId', typeSort: 'ASC', currentPage: 1, pageSize: 1 }
    this.intervencionService.ListarIntervenciones(paginationIntervencion)
      .subscribe( resp => {
        const intervencion = resp.data.length > 0 ? resp.data[0] : null
        descripcionControl?.setValue( intervencion ? intervencion.nombreProyecto : null)
        intervencionIdControl?.setValue( intervencion ? intervencion.intervencionId : 0)
        intervencion ? descripcionControl?.disable() : descripcionControl?.enable()
      })
  }

  obtenerSector(){
    const sectorvalue = this.formIntervencionEspacio.get('sectorId')?.value
    const entidadSectorControl = this.formIntervencionEspacio.get('entidadSectorId')

    sectorvalue ? entidadSectorControl?.enable() : entidadSectorControl?.disable()
    if(sectorvalue){
      this.obtenerEntidadSector()
    } else {
      entidadSectorControl?.reset()
    }
  }

  // obtenerSectoresServices()
  // {
  //   this.sectorService.getAllSectors().subscribe( resp => this.sectores.set(resp.data.filter( item => this.sectoresValidos.includes(Number(item.grupoID)))))  
  // }

  obtenerEntidadSector(){
    const sectorId = this.formIntervencionEspacio.get('sectorId')?.value
    const pagination: Pagination = { ...this.pagination, sectorId, columnSort: 'entidadId' }
    this.entidadService.listarEntidades(pagination).subscribe( resp => this.sectorEntidades.set(resp.data) )
  }

  obtenerDepartamento(){
    const entidadubigeoIdControl = this.formIntervencionEspacio.get('entidadUbigeoId')
    const departamento = this.formIntervencionEspacio.get('departamento')?.value
    const provinciaControl = this.formIntervencionEspacio.get('provincia')
    const distritoControl = this.formIntervencionEspacio.get('distrito')
    let ubigeo = '' 
    if(departamento){
      ubigeo = `${departamento}0000`
      provinciaControl?.enable()
      this.obtenerProvinciaServices(departamento)
    } else {
      provinciaControl?.disable()
      provinciaControl?.reset()
    }

    distritoControl?.disable()
    distritoControl?.reset()    
    this.obtenerEntidadService(ubigeo)
  }

  obtenerProvinciaServices(departamento: string){
    this.ubigeoService.getProvinces(departamento).subscribe( resp => this.provincias.set(resp.data))
  }

  obtenerProvincia(){
    const departamento = this.formIntervencionEspacio.get('departamento')?.value
    let ubigeo = `${departamento.departamentoId}0000`
    const provincia = this.formIntervencionEspacio.get('provincia')?.value
    const distritoControl = this.formIntervencionEspacio.get('distrito')    
    if(provincia){
      ubigeo = provincia
      distritoControl?.enable()
      this.obtenerDistritoServices(ubigeo)
    } else {
      ubigeo = `${departamento.departamentoId}0000`
      distritoControl?.disable()
    }
    this.obtenerEntidadService(ubigeo)
  }

  obtenerDistritoServices(provincia: string){
    this.ubigeoService.getDistricts(provincia).subscribe( resp => this.distritos.set(resp.data))
  }

  obtenerDistrito(){
    const provinciaValue = this.formIntervencionEspacio.get('provincia')?.value
    const distritoValue = this.formIntervencionEspacio.get('distrito')?.value
    const ubigeo = distritoValue ? distritoValue : provinciaValue
    this.obtenerEntidadService(ubigeo)
  }

  obtenerEntidadService(ubigeo: string){
    const entidadUbigeoIdControl = this.formIntervencionEspacio.get('entidadUbigeoId')
    this.entidadService.getEntidadPorUbigeo(ubigeo)
      .subscribe(resp => {
        const entidad = resp.data
        entidadUbigeoIdControl?.setValue(entidad ? entidad.entidadId : null)
      })
  }

  obtenerFase(inicial: boolean = true){
    const faseControl: string = inicial ? 'inicioIntervencionFaseId' : 'objetivoIntervencionFaseId'
    const etapaControl: string = inicial ? 'inicioIntervencionEtapaId' : 'objetivoIntervencionEtapaId'
    const hitoControl: string = inicial ? 'inicioIntervencionHitoId' : 'objetivoIntervencionHitoId'
    const intervencionFaseId = this.formIntervencionEspacio.get(faseControl)?.value
    const intervencionEtapaControl = this.formIntervencionEspacio.get(etapaControl)
    const intervencionHitoControl = this.formIntervencionEspacio.get(hitoControl)
    if(intervencionFaseId){
      intervencionEtapaControl?.enable()
      intervencionEtapaControl?.reset()
      this.obtenerIntervencionEtapaService(inicial)
    } else {
      intervencionEtapaControl?.disable()
    }
    intervencionHitoControl?.disable()
    intervencionHitoControl?.reset()
  }

  obtenerIntervencionEtapaService(inicial: boolean){
    const faseControl: string = inicial ? 'inicioIntervencionFaseId' : 'objetivoIntervencionFaseId'
    const faseId = this.formIntervencionEspacio.get(faseControl)?.value
    this.intervencionEtapaService.ListarIntervencionEtapas({...this.pagination, faseId}).subscribe( resp => inicial ? this.etapasInicial.set(resp.data) : this.etapasObjetivo.set(resp.data))
  }

  obtenerEtapa(inicial: boolean = true){    
    const etapaControl: string = inicial ? 'inicioIntervencionEtapaId' : 'objetivoIntervencionEtapaId'
    const hitoControl: string = inicial ? 'inicioIntervencionHitoId' : 'objetivoIntervencionHitoId'
    const intervencionEtapaId = this.formIntervencionEspacio.get(etapaControl)?.value
    const intervencionHitoControl = this.formIntervencionEspacio.get(hitoControl)
      intervencionHitoControl?.reset()
    if(intervencionEtapaId){
      intervencionHitoControl?.enable()
      this.obtenerIntervencionHitoService(inicial)
    } else {
      intervencionHitoControl?.disable()
    }
  }

  obtenerIntervencionHitoService(inicial: boolean){
    const etapaControl: string = inicial ? 'inicioIntervencionEtapaId' : 'objetivoIntervencionEtapaId' 
    const etapaId = this.formIntervencionEspacio.get(etapaControl)?.value 
    this.intervencionHitoService.ListarIntervencionHitos({...this.pagination, etapaId }).subscribe( resp => inicial ? this.hitosInicial.set(resp.data) : this.hitosObjetivo.set(resp.data) )
  }
}
