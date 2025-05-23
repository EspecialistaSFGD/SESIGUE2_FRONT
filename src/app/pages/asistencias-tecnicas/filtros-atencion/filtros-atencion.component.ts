import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { getDateFormat } from '@core/helpers';
import { EventoResponse, ItemEnum, Pagination, SectorResponse, TipoEntidadResponse } from '@core/interfaces';
import { EventosService, SectoresService, TipoEntidadesService } from '@core/services';
import { ValidatorService } from '@core/services/validators';
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
  @Input() paginationFilters: Pagination = {}
  @Input() permisosPCM: boolean = false
  @Output() visibleDrawer = new EventEmitter()
  @Output() filters = new EventEmitter<Pagination>()
  @Output() export = new EventEmitter<boolean>()
  
  public tipoEntidades = signal<TipoEntidadResponse[]>([])
  public eventos = signal<EventoResponse[]>([])
  sectores = signal<SectorResponse[]>([])

  private fb = inject(FormBuilder)
  private tipoEntidadService = inject(TipoEntidadesService)
  private eventosService = inject(EventosService)
  private sectoresService = inject(SectoresService)
  private validatorsService = inject(ValidatorService)

  private timeout: any;
  pagination: Pagination = {
    code: 0,
    columnSort: 'fechaRegistro',
    typeSort: 'ASC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  formFilters: FormGroup = this.fb.group({
    codigo: [''],
    fechaInicio: [''],
    fechaFin: [''],
    tipoEntidad: [''],
    tipoAtencion: [''],
    departameno: [''],
    provincia: [''],
    distrito: [''],
    ubigeo: [''],
    sectorId: [null],
    eventoId: [null],
    unidadOrganica: [''],
    especialista: [''],
  })

  ngOnInit(): void {
    this.getAllTipoEntidades()
    this.obtenerServiciosEventos()
    this.obtenerServicioSectores()
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

  obtenerServiciosEventos() {
    const vigenteId = this.permisosPCM ? [2,3,4] : [2,3]
    const tipoEvento = this.permisosPCM ? [8,9] : [8]
    this.eventosService.getAllEventos(tipoEvento, 1, vigenteId, {...this.pagination, columnSort: 'eventoId', pageSize: 100, typeSort: 'DESC'})
      .subscribe(resp => {
        this.eventos.set(resp.data)
      })
  }

  obtenerServicioSectores() {
    this.sectoresService.getAllSectors()
      .subscribe(resp => {        
        this.sectores.set(resp.data)
      })
  }

  changeCodigo(event: any){
    const codigoControl = this.formFilters.get('codigo')
    const codigoValue = codigoControl?.value

    if(codigoValue){
      clearTimeout(this.timeout);
      var $this = this;
      this.timeout = setTimeout(function () {
        if ($this.validatorsService.codigoPattern.test(event.key) || event.key === 'Backspace' || event.key === 'Delete' || codigoValue.length > 0) {          
          $this.paginationFilters.codigo = codigoValue          
          $this.generateFilters()
        }
      }, 500);
    } else {      
      delete this.paginationFilters.codigo
      this.generateFilters()
    }
  }

  changefechaInicio(){
    const fechaInicioValue = this.formFilters.get('fechaInicio')?.value    
    if(fechaInicioValue){      
      this.paginationFilters.fechaInicio = getDateFormat(fechaInicioValue)
    } else {
      delete this.paginationFilters.fechaInicio
    }
    this.generateFilters()
  }
    
  changeFechaFin(){
    const fechaFinValue = this.formFilters.get('fechaFin')?.value
    if(fechaFinValue){
      this.paginationFilters.fechaFin = getDateFormat(fechaFinValue)
    } else {
      delete this.paginationFilters.fechaFin
    }      
    this.generateFilters()
  }

  changeEvento(){
    const eventoValue = this.formFilters.get('eventoId')?.value

    if(eventoValue){
      const evento = this.eventos().find(e => e.eventoId === eventoValue)

      const fechaInicioControl = this.formFilters.get('fechaInicio')
      const fechaFinControl = this.formFilters.get('fechaFin')
      const sectorControl = this.formFilters.get('sectorId')
      evento?.abreviatura.toLowerCase() == 'poi' ? fechaInicioControl?.enable() : fechaInicioControl?.disable()
      evento?.abreviatura.toLowerCase() == 'poi' ? fechaFinControl?.enable() : fechaFinControl?.disable()
      evento?.abreviatura.toLowerCase() == 'poi' ? fechaInicioControl?.setValue(fechaInicioControl?.value) : fechaInicioControl?.setValue(null)
      evento?.abreviatura.toLowerCase() == 'poi' ? fechaFinControl?.setValue(fechaFinControl?.value) : fechaFinControl?.setValue(null)
      evento?.abreviatura.toLowerCase() == 'poi' ? sectorControl?.disable() : sectorControl?.enable()
      evento?.abreviatura.toLowerCase() == 'poi' ? sectorControl?.setValue(null) : sectorControl?.setValue(sectorControl?.value)
      if(evento?.abreviatura.toLowerCase() != 'poi'){
        delete this.paginationFilters.fechaInicio
        delete this.paginationFilters.fechaFin
      } else {
        delete this.paginationFilters.sectorId
      }

      this.paginationFilters.eventoId = eventoValue
    } else {
      delete this.paginationFilters.eventoId
    }
    
    this.generateFilters()
  }

  changeSector(){
    const sectorValue = this.formFilters.get('sectorId')?.value
    if(sectorValue){
      this.paginationFilters.sectorId = sectorValue
    } else {
      delete this.paginationFilters.sectorId
    }
    
    this.generateFilters()
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
