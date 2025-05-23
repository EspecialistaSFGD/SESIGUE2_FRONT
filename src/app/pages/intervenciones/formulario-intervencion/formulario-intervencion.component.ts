import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IntervencionEspacioOriginEnum } from '@core/enums';
import { convertEnumToObject, typeErrorControl } from '@core/helpers';
import { DataModalIntervencion, EntidadResponse, IntervencionEspacioOriginResponse, IntervencionEspacioSubTipo, IntervencionEspacioTipo, IntervencionEtapaResponse, IntervencionFaseResponse, IntervencionHitoResponse, ItemEnum, Pagination, SectorResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { EntidadesService, IntervencionEtapaService, IntervencionFaseService, IntervencionHitoService, SectoresService, UbigeosService } from '@core/services';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-formulario-intervencion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNgModule],
  templateUrl: './formulario-intervencion.component.html',
  styles: ``
})
export class FormularioIntervencionComponent {
  readonly dataIntervencionTarea: DataModalIntervencion = inject(NZ_MODAL_DATA);

  create: boolean = this.dataIntervencionTarea.create
  origen: IntervencionEspacioOriginResponse = this.dataIntervencionTarea.origen

  paginationIntervencionData: Pagination = {
    columnSort: 'nombre',
    typeSort: 'ASC',
    pageSize: 100,
    currentPage: 1
  }

  origenes: ItemEnum[] = convertEnumToObject(IntervencionEspacioOriginEnum)

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

  sectores = signal<SectorResponse[]>([])
  sectorEntidades = signal<EntidadResponse[]>([])
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

  formIntervencionEspacio: FormGroup = this.fb.group({
    tipoIntervencion: [ '', Validators.required ],
    subTipoIntervencion: [ { value: '', disabled: true }, Validators.required ],
    codigoIntervencion: [ { value: '', disabled: true }, Validators.required ],
    sectorId: [ '', Validators.required ],
    entidadSectorId: [ { value: '', disabled: true }, Validators.required ],
    departamento: ['', Validators.required ],
    provincia: [{ value: '', disabled: true }],
    distrito: [{ value: '', disabled: true }],
    entidadUbigeoId: [ '', Validators.required ],
    tipoEvento: [ '', Validators.required ],
    eventoId: [ '', Validators.required ],
    tipoEventoId: [ '', Validators.required ],
    origenId: [ '', Validators.required ],
    interaccionId: [ '', Validators.required ],
    inicioIntervencionFaseId: [ '', Validators.required ],
    inicioIntervencionEtapaId: [ { value: '', disabled: true }, Validators.required ],
    inicioIntervencionHitoId: [ { value: '', disabled: true }, Validators.required ],
    objetivoIntervencionFaseId: [ '', Validators.required ],
    objetivoIntervencionEtapaId: [ { value: '', disabled: true }, Validators.required ],
    objetivoIntervencionHitoId: [ { value: '', disabled: true }, Validators.required ],
  })

  ngOnInit(): void {
    const origenId = this.origenes.find( item => item.value.toLowerCase() == this.origen.origen.toLowerCase())?.text
    this.formIntervencionEspacio.get('origenId')?.setValue(origenId)
    this.formIntervencionEspacio.get('interaccionId')?.setValue(this.origen.interaccionId)

    this.obtenerSectoresServices()
    this.obtenerDepartamentoServices()
    this.obtenerIntervencionFaseService()
    this.obtenerIntervencionFaseService(false)
  }

  alertMessageError(control: string) {
      return this.formIntervencionEspacio.get(control)?.errors && this.formIntervencionEspacio.get(control)?.touched
    }
  
    msgErrorControl(control: string, label?: string): string {
      const text = label ? label : control
      const errors = this.formIntervencionEspacio.get(control)?.errors;
  
      return typeErrorControl(text, errors)
    }

  obtenerSectoresServices(){
    this.sectorService.getAllSectors().subscribe( resp => this.sectores.set(resp.data))
  }

  obtenerDepartamentoServices(){
    this.ubigeoService.getDepartments().subscribe( resp => this.departamentos.set(resp.data))
  }

  obtenerIntervencionFaseService(inicial: boolean = true){
    this.intervencionFaseService.ListarIntervencionFases(this.paginationIntervencionData)
      .subscribe( resp => inicial ? this.fasesInicial.set(resp.data) : this.fasesObjetivo.set(resp.data) )
  }

  obtenerTipo(){
    const tipoValue = this.formIntervencionEspacio.get('tipoIntervencion')?.value
    const subTipoControl = this.formIntervencionEspacio.get('subTipoIntervencion')
    const codigoIntervencionControl = this.formIntervencionEspacio.get('codigoIntervencion')
    if(tipoValue){
      const subTipos = this.subTipos.filter( item => item.tipoId == tipoValue)
      this.intervencionSubTipos.set(subTipos)
    } else {
      this.intervencionSubTipos.set([])
      subTipoControl?.reset()
    }

    tipoValue ? subTipoControl?.enable() : subTipoControl?.disable()
    codigoIntervencionControl?.reset()
    codigoIntervencionControl?.disable()
  }

  obtenerSubTipo(){
    const subTipoValue = this.formIntervencionEspacio.get('subTipoIntervencion')?.value
    const codigoIntervencionControl = this.formIntervencionEspacio.get('codigoIntervencion')
    if(!subTipoValue){
      codigoIntervencionControl?.reset()
    }
    subTipoValue ? codigoIntervencionControl?.enable() : codigoIntervencionControl?.disable()
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

  obtenerEntidadSector(){
    const sectorId = this.formIntervencionEspacio.get('sectorId')?.value
    const paginationEntidadSector: Pagination = { entidadId: 0, tipo: '1', sectorId }
    this.entidadService.listarEntidades(paginationEntidadSector).subscribe( resp => this.sectorEntidades.set(resp.data) )
  }

  obtenerDepartamento(){
    const departamento = this.formIntervencionEspacio.get('departamento')?.value
    const provinciaControl = this.formIntervencionEspacio.get('provincia')
    const distritoControl = this.formIntervencionEspacio.get('distrito')
    let ubigeo = null 
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
      distritoControl?.disable()
    }    
  }

  obtenerDistritoServices(provincia: string){
    this.ubigeoService.getDistricts(provincia).subscribe( resp => this.distritos.set(resp.data))
  }

  obtenerDistrito(){

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
    this.intervencionEtapaService.ListarIntervencionEtapas({...this.paginationIntervencionData, faseId}).subscribe( resp => inicial ? this.etapasInicial.set(resp.data) : this.etapasObjetivo.set(resp.data))
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
    this.intervencionHitoService.ListarIntervencionHitos({...this.paginationIntervencionData, etapaId }).subscribe( resp => inicial ? this.hitosInicial.set(resp.data) : this.hitosObjetivo.set(resp.data) )
  }
}
