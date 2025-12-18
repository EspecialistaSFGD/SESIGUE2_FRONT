import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { deleteKeyNullToObject, saveFilterStorage } from '@core/helpers';
import { EventoResponse, Pagination, TipoEventoResponse } from '@core/interfaces';
import { EventosService, TipoEventosService } from '@core/services';
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

  tipoEventos = signal<TipoEventoResponse[]>([])
  eventos = signal<EventoResponse[]>([])

  private fb = inject(FormBuilder)
  private tipoEventosServices = inject(TipoEventosService)
  private eventosService = inject(EventosService)

  formActividadFilters:FormGroup = this.fb.group({
    tipoEspacioId: [ null ],
    espacioId: [{ value: null, disabled: true }]
  })

  ngOnChanges(changes: SimpleChanges): void {
    const pagination = { ...this.pagination }
    pagination.tipoEspacioId = pagination.tipoEspacioId ? Number(pagination.tipoEspacioId) : null
    pagination.espacioId = pagination.espacioId ? Number(pagination.espacioId) : null
    this.formActividadFilters.reset(pagination)

    this.obtenerServicioTipoEspacio()
    if(pagination.tipoEspacioId){
      this.obtenerEventosService()
      this.formActividadFilters.get('espacioId')?.enable()
    }
  }

  obtenerServicioTipoEspacio() {
    const pagination: Pagination = { code: 0, columnSort: 'codigoTipoEvento', typeSort: 'ASC', pageSize: 10, currentPage: 1, total: 0}
    this.tipoEventosServices.getAllTipoEvento(pagination).subscribe(resp => this.tipoEventos.set(resp.data))
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
