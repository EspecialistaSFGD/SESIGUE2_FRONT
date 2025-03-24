import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EventoResponse, ItemEnum, Pagination, TipoEntidadResponse } from '@core/interfaces';
import { EventosService, TipoEntidadesService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';

@Component({
  selector: 'app-filtros-atencion',
  standalone: true,
  imports: [CommonModule, NgZorroModule, ReactiveFormsModule, PrimeNgModule],
  templateUrl: './filtros-atencion.component.html',
  styles: ``
})
export class FiltrosAtencionComponent {
  @Input() visible: boolean = false
  @Input() tipos!: ItemEnum[]
  @Input() permisosPCM: boolean = false
  @Output() visibleDrawer = new EventEmitter()
  @Output() filters = new EventEmitter<Pagination>()
  @Output() export = new EventEmitter<boolean>()
  
  public tipoEntidades = signal<TipoEntidadResponse[]>([])
  public eventos = signal<EventoResponse[]>([])

  private fb = inject(FormBuilder)
  private tipoEntidadService = inject(TipoEntidadesService)
  private eventosService = inject(EventosService)

  pagination: Pagination = {
    code: 0,
    columnSort: 'fechaRegistro',
    typeSort: 'ASC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  paginationFilters: Pagination = {}

  formFilters: FormGroup = this.fb.group({
    fechaInicio: [''],
    fechaFin: [''],
    tipoEntidad: [''],
    tipoAtencion: [''],
    departameno: [''],
    provincia: [''],
    distrito: [''],
    ubigeo: [''],
    eventoId: [null],
    unidadOrganica: [''],
    especialista: [''],
  })

  ngOnInit(): void {
    this.getAllTipoEntidades()
    this.obtenerEventos()
  }

  changeVisibleDrawer(visible: boolean){
    this.visibleDrawer.emit(visible)
  }

  getAllTipoEntidades() {    
    this.pagination.columnSort = 'nombre'
    this.tipoEntidadService.getAllTipoEntidades(this.pagination)
      .subscribe(resp => {
        this.tipoEntidades.set(resp.data)
      })
  }

  obtenerEventos() {
    const vigenteId = this.permisosPCM ? [2,3,4] : [2,3]
    const tipoEvento = this.permisosPCM ? null : 8
    this.eventosService.getAllEventos(tipoEvento, 1, vigenteId, {...this.pagination, columnSort: 'eventoId', pageSize: 100, typeSort: 'DESC'})
      .subscribe(resp => {
        this.eventos.set(resp.data)
      })
  }

  changefechaInicio(){
    const fechaInicioValue = this.formFilters.get('fechaInicio')?.value
    if(fechaInicioValue){
      this.paginationFilters.fechaInicio = this.getFormatDate(fechaInicioValue)
    } else {
      delete this.paginationFilters.fechaInicio
    }
    this.generateFilters()
  }
    
  changeFechaFin(){
    const fechaFinValue = this.formFilters.get('fechaFin')?.value
    if(fechaFinValue){
      this.paginationFilters.fechaFin = this.getFormatDate(fechaFinValue)
    } else {
      delete this.paginationFilters.fechaFin
    }      
    this.generateFilters()
  }

  changeEvento(){
    const evento = this.formFilters.get('eventoId')?.value
    if(evento){
      this.paginationFilters.eventoId = evento.eventoId
      // this.paginationFilters.eventoId = evento
    } else {
      delete this.paginationFilters.eventoId
    }
    
    this.generateFilters()
  }

  getFormatDate(fecha: string){
    const date = new Date(fecha)
    const month = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`
    const day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`
    return `${day}/${month}/${date.getFullYear()}`
  }

  generateFilters(){
    if(this.permisosPCM){
      delete this.paginationFilters.tipoPerfil
    } else {
      this.paginationFilters.tipoPerfil = '1'
    }
    
    this.filters.emit(this.paginationFilters)
  }

  changeExport(){
    this.changeVisibleDrawer(false)
    this.export.emit(true)
  }
}
