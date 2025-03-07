import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ItemEnum, Pagination, TipoEntidadResponse } from '@core/interfaces';
import { TipoEntidadesService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';

@Component({
  selector: 'app-filtros-atencion',
  standalone: true,
  imports: [CommonModule, NgZorroModule, ReactiveFormsModule],
  templateUrl: './filtros-atencion.component.html',
  styles: ``
})
export class FiltrosAtencionComponent {
  @Input() visible: boolean = false
  @Input() tipos!: ItemEnum[]
  @Output() visibleDrawer = new EventEmitter()
  @Output() filters = new EventEmitter<Pagination>()
  @Output() export = new EventEmitter<boolean>()
  
  public tipoEntidades = signal<TipoEntidadResponse[]>([])

  private fb = inject(FormBuilder)
  private tipoEntidadService = inject(TipoEntidadesService)

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
    sector: [''],
    unidadOrganica: [''],
    especialista: [''],
  })

  ngOnInit(): void {
    this.getAllTipoEntidades()
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

    changefechaInicio(){
      const fechaInicioValue = this.formFilters.get('fechaInicio')?.value      
      this.paginationFilters.fechaInicio = this.getFormatDate(fechaInicioValue)
      this.generateFilters()
    }
    
    changeFechaFin(){
      const fechaFinValue = this.formFilters.get('fechaFin')?.value
      this.paginationFilters.fechaFin = this.getFormatDate(fechaFinValue)
      this.generateFilters()
    }

    getFormatDate(fecha: string){
      const date = new Date(fecha)
      const month = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`
      const day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`
      return `${day}/${month}/${date.getFullYear()}`
    }

    generateFilters(){
      this.filters.emit(this.paginationFilters)
    }

    changeExport(){
      this.changeVisibleDrawer(false)
      this.export.emit(true)
    }
}
