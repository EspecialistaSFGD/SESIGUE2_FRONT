import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EventoResponse, Pagination, SectorResponse, TipoEntidadResponse, TipoEventoResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { EventosService, SectoresService, TipoEntidadesService, TipoEventosService, UbigeosService } from '@core/services';
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

  formFilterPanel: FormGroup = this.fb.group({
    tipoEspacioId: [null],
    eventoId: [{ value: null, disabled: true}],
    entidadUbigeoId: [null],
    sectorId: [null],
    nivelGobiernoId: [null],
    codigoUnico: [null],
    departamento: [null],
    distrito: [{ value: null, disabled: true}],
    provincia: [{ value: null, disabled: true}],
  })
  ngOnInit(): void {
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

  }
  obtenerEventosServices(tipoEventoId: number){    
    const paginationTipoEvento: Pagination = { columnSort: 'eventoId', typeSort: 'ASC', pageSize: 100, currentPage: 1 }
    this.eventosService.getAllEventos([tipoEventoId], 1, [1, 2, 3], paginationTipoEvento).subscribe( resp => this.eventos.set(resp.data))
  }

  obtenerDepartamento(){
    const departamento = this.formFilterPanel.get('departamento')?.value
    const provinciaControl = this.formFilterPanel.get('provincia')
    const distritoControl = this.formFilterPanel.get('distrito')
    let ubigeo = null 
    if(departamento){
      ubigeo = `${departamento}0000`
      provinciaControl?.enable()
      this.obtenerProvinciasService(departamento)
    } else {
      provinciaControl?.disable()
      provinciaControl?.reset()
    }
    
    distritoControl?.disable()
    distritoControl?.reset()
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
  }

  obtenerDistritosService(provincia: string) {
    this.ubigeoService.getDistricts(provincia)
      .subscribe(resp => {
        this.distritos.set(resp.data)
      })
  }

  obtenerDistrito(){

  }
}
