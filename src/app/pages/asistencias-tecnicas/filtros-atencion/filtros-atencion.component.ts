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

  formFilters: FormGroup = this.fb.group({
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
}
