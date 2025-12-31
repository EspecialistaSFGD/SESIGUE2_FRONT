import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { deleteKeyNullToObject, saveFilterStorage } from '@core/helpers';
import { EventoResponse, Pagination, SectorResponse, TipoEventoResponse } from '@core/interfaces';
import { EventosService, SectoresService, TipoEventosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';

@Component({
  selector: 'app-filtro-actividades',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgZorroModule, PrimeNgModule],
  templateUrl: './filtro-actividades.component.html',
  styles: ``
})
export class FiltroActividadesComponent {
  @Input() visible: boolean = false
  @Input() pagination: any = {}

  @Output() filters = new EventEmitter<Pagination>();
  @Output() visibleDrawer = new EventEmitter()

  permisosPCM: boolean = false

  tipoEventos = signal<TipoEventoResponse[]>([])
  eventos = signal<EventoResponse[]>([])
  sectores = signal<SectorResponse[]>([])

  private fb = inject(FormBuilder)
  private tipoEventosServices = inject(TipoEventosService)
  private eventosService = inject(EventosService)
  private sectoresService = inject(SectoresService)

  formActividadFilters:FormGroup = this.fb.group({
    tipoEspacioId: [ null ],
    espacioId: [{ value: null, disabled: true }],
    sectorId: [ null ]
  })

  ngOnChanges(changes: SimpleChanges): void {
    this.permisosPCM = this.setPermisosPCM()
    const pagination = { ...this.pagination }
    pagination.tipoEspacioId = pagination.tipoEspacioId ? Number(pagination.tipoEspacioId) : null
    pagination.espacioId = pagination.espacioId ? Number(pagination.espacioId) : null
    pagination.sectorId = pagination.sectorId ? Number(pagination.sectorId) : null
    this.formActividadFilters.reset(pagination)

    this.obtenerServicioTipoEspacio()
    this.obtenerSectoresServicio()
    if(pagination.tipoEspacioId){
      this.obtenerEventosService()
      this.formActividadFilters.get('espacioId')?.enable()
    }
  }

  setPermisosPCM(){
    const permisosStorage = localStorage.getItem('permisosPcm') ?? ''
    return JSON.parse(permisosStorage) ?? false
  }

  obtenerServicioTipoEspacio() {
    const pagination: Pagination = { code: 0, columnSort: 'codigoTipoEvento', typeSort: 'ASC', pageSize: 10, currentPage: 1, total: 0}
    this.tipoEventosServices.getAllTipoEvento(pagination).subscribe(resp => this.tipoEventos.set(resp.data))
  }

  obtenerSectoresServicio() {
    const pagination:Pagination = { columnSort: 'grupoID', typeSort: 'DESC', pageSize: 50, currentPage: 1 }
    this.sectoresService.listarSectores(pagination).subscribe(resp => { this.sectores.set(resp.data.filter(item =>  item.grupoID != '0')) })
  }

  changeEspacio(){
    const tipoEspacioId = this.formActividadFilters.get('tipoEspacioId')?.value
    const espacioControl = this.formActividadFilters.get('espacioId')
    if(tipoEspacioId){
      this.obtenerEventosService()
      espacioControl?.enable()
    } else {
      espacioControl?.setValue(null)
      espacioControl?.disable()
    }
  }

  obtenerEventosService(){
    const tipoEspacioId = this.formActividadFilters.get('tipoEspacioId')?.value
    const pagination: Pagination = { tipoEventosId: [tipoEspacioId], columnSort: 'eventoId', typeSort: 'DESC', currentPage: 1, pageSize: 20 }
    this.eventosService.ListarEventos(pagination).subscribe(resp => this.eventos.set(resp.data))
  }

  changeVisibleDrawer(){    
    this.visibleDrawer.emit(false)
  }

  saveFilter(){
    const pagination = deleteKeyNullToObject(this.formActividadFilters.value)
    saveFilterStorage(pagination,'filtrosActividades','actividadId','DESC')
    this.changeVisibleDrawer()
  }

  cleanParams(){
    localStorage.removeItem('filtrosActividades');
    this.formActividadFilters.reset()
    this.generateFilters()
    this.changeVisibleDrawer()
  }

  generateFilters(){ 
    const formValue = { ...this.formActividadFilters.value }   
    this.filters.emit(formValue)
  }
}
