import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventoResponse, Pagination, SectorResponse, TipoEntidadResponse, TipoEventoResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { EntidadesService, EventosService, SectoresService, TipoEntidadesService, TipoEventosService, UbigeosService } from '@core/services';
import { ValidatorService } from '@core/services/validators';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';

@Component({
  selector: 'app-intervencion-panel-filtros',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNgModule],
  templateUrl: './intervencion-panel-filtros.component.html',
  styles: ``
})
export class IntervencionPanelFiltrosComponent {

  @Input() pagination!: Pagination

  @Output() filterPagination = new EventEmitter<Pagination>()

  private timeout: any;

  sectores = signal<SectorResponse[]>([])
  tiposEventos = signal<TipoEventoResponse[]>([])
  eventos = signal<EventoResponse[]>([])
  departamentos = signal<UbigeoDepartmentResponse[]>([])
  provincias = signal<UbigeoProvinciaResponse[]>([])
  distritos = signal<UbigeoDistritoResponse[]>([])
  tipoEntidades = signal<TipoEntidadResponse[]>([])

  private fb = inject(FormBuilder)
  private sectorService = inject(SectoresService)
  private ubigeoService = inject(UbigeosService)
  private tiposEventosService = inject(TipoEventosService)
  private eventosService = inject(EventosService)
  private tipoEntidadService = inject(TipoEntidadesService)
  private entidadService = inject(EntidadesService)
  private validatorService = inject(ValidatorService)

  formFilterPanel: FormGroup = this.fb.group({
    tipoEspacioId: [null],
    eventoId: [{ value: null, disabled: true}],
    sectorId: [null],
    nivelGobiernoId: [null],
    codigoUnico: [null],
    departamento: [null],
    distrito: [{ value: null, disabled: true}],
    provincia: [{ value: null, disabled: true}],
    entidadUbigeoId: [null],
  })

  ngOnInit(): void {
    console.log(this.pagination);
    this.obtenerSectoresServices()
    this.obtenerDepartamentoServices()
    this.obtenerTipoEventoServices()
    this.obtenerTipoEntidadesService()
  }

  obtenerSectoresServices(){
    this.sectorService.getAllSectors().subscribe( resp => this.sectores.set(resp.data.filter( item => Number(item.grupoID) >= 1)))
  }

  obtenerDepartamentoServices(){
    this.ubigeoService.getDepartments().subscribe( resp => this.departamentos.set(resp.data))
  }

  obtenerTipoEventoServices(){
    const paginationTipoEvento: Pagination = { columnSort: 'codigoTipoEvento', typeSort: 'ASC', pageSize: 100, currentPage: 1 }
    this.tiposEventosService.getAllTipoEvento(paginationTipoEvento).subscribe( resp => this.tiposEventos.set(resp.data))
  }

  obtenerTipoEntidadesService() {
    const pagination: Pagination = { columnSort: 'nombre', typeSort: 'ASC', pageSize: 10, currentPage: 1, total: 0 }  
    this.tipoEntidadService.getAllTipoEntidades(pagination)
      .subscribe(resp => {
        const tipoHidden:string[] = ['MR','MM']
        const tipos = resp.data.filter(item => !tipoHidden.includes(item.abreviatura.toUpperCase()))
        this.tipoEntidades.set(tipos)
      })
  }

  obtenerSector(){
    const sectorId = this.formFilterPanel.get('sectorId')?.value
    sectorId ? this.pagination.sectorId = sectorId : delete this.pagination.sectorId
    this.setPagination()
  }

  obtenerTipoEvento(){
    const tipoEspacioControl = this.formFilterPanel.get('tipoEspacioId')
    const eventoControl = this.formFilterPanel.get('eventoId')
    const tipoEspacioId = tipoEspacioControl?.value
    if(tipoEspacioId){
      this.obtenerEventosServices(tipoEspacioId)
      eventoControl?.enable()
    } else {
      eventoControl?.reset()
      eventoControl?.disable()
    }
    tipoEspacioId ? this.pagination.tipoEspacioId = tipoEspacioId : delete this.pagination.tipoEspacioId
    this.setPagination()
  }

  obtenerEvento(){
    const eventoId = this.formFilterPanel.get('eventoId')?.value
    eventoId ? this.pagination.eventoId = eventoId : delete this.pagination.eventoId
    this.setPagination()
  }

  obtenerEventosServices(tipoEventoId: number){    
    const paginationTipoEvento: Pagination = { columnSort: 'eventoId', typeSort: 'ASC', pageSize: 100, currentPage: 1 }
    this.eventosService.getAllEventos([tipoEventoId], 1, [1, 2, 3], paginationTipoEvento).subscribe( resp => this.eventos.set(resp.data))
  }

  changeCodigo(event: any){
    const codigoValue = this.formFilterPanel.get('codigoUnico')?.value
    if(codigoValue){
      clearTimeout(this.timeout);
      var $this = this;
      this.timeout = setTimeout(function () {
        if ($this.validatorService.sevenNumberPattern.test(event.key) ||  event.key === 'Backspace' || event.key === 'Delete' || codigoValue.length > 0) {
          $this.pagination.codigoUnico = codigoValue
          $this.setPagination()
        }
      }, 500);
    } else {      
      delete this.pagination.codigoUnico
      this.setPagination()
    }
  }

  obtenerNivelGobierno(){
    const nivelGobiernoId = this.formFilterPanel.get('nivelGobiernoId')?.value
    nivelGobiernoId ? this.pagination.nivelGobiernoId = nivelGobiernoId : delete this.pagination.nivelGobiernoId
    this.setPagination()
  }

  obtenerDepartamento(){
    const departamento = this.formFilterPanel.get('departamento')?.value
    const provinciaControl = this.formFilterPanel.get('provincia')
    const distritoControl = this.formFilterPanel.get('distrito')
    let ubigeo = '' 
    if(departamento){
      this.pagination.nivelUbigeo = '1'
      ubigeo = `${departamento}0000`
      provinciaControl?.enable()
      this.obtenerProvinciasService(departamento)
    } else {
      this.pagination.nivelUbigeo = ''
      provinciaControl?.disable()
      provinciaControl?.reset()
    }
    
    distritoControl?.disable()
    distritoControl?.reset()
    this.obtenerEntidadPorUbigeoService(ubigeo)
  }

  obtenerProvinciasService(departamento: string) {
    this.ubigeoService.getProvinces(departamento)
      .subscribe(resp => {
        this.provincias.set(resp.data)
      })
  }

  obtenerProvincia(){
    const departamento = this.formFilterPanel.get('departamento')?.value
    let ubigeo = `${departamento.departamentoId}0000`
    const provincia = this.formFilterPanel.get('provincia')?.value
    const distritoControl = this.formFilterPanel.get('distrito')  
    if(provincia){
      ubigeo = provincia
      distritoControl?.enable()
      this.obtenerDistritosService(ubigeo)
    } else {
      distritoControl?.disable()
    }
    const nivelUbigeo = provincia ? '2' : '1'
    this.pagination.nivelUbigeo = nivelUbigeo
    this.obtenerEntidadPorUbigeoService(`${departamento}0000`)
  }

  obtenerDistritosService(provincia: string) {
    this.ubigeoService.getDistricts(provincia)
      .subscribe(resp => {
        this.distritos.set(resp.data)
      })
  }

  obtenerDistrito(){
    const provinciaValue = this.formFilterPanel.get('provincia')?.value
    const distritoValue = this.formFilterPanel.get('distrito')?.value
    const ubigeo = distritoValue ? distritoValue : provinciaValue
    const nivelUbigeo = distritoValue ? '3' : '2'
    this.pagination.nivelUbigeo = nivelUbigeo
    this.obtenerEntidadPorUbigeoService(ubigeo)
  }

  obtenerEntidadPorUbigeoService(ubigeo: string){    
    this.entidadService.getEntidadPorUbigeo(ubigeo)
      .subscribe(resp => {        
        const entidad = resp.data
        entidad ? this.pagination.entidadUbigeoId = entidad.entidadId : delete this.pagination.entidadUbigeoId
        this.setPagination()
      })
  }

  setPagination(){
    this.filterPagination.emit(this.pagination)
  }
}
