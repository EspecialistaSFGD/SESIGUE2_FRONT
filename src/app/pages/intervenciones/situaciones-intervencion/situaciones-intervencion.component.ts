import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { DataModalIntervencionSituacion, IntervencionEspacioResponse, IntervencionSituacionResponse, Pagination } from '@core/interfaces';
import { IntervencionSituacionService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-situaciones-intervencion',
  standalone: true,
  imports: [CommonModule, NgZorroModule],
  templateUrl: './situaciones-intervencion.component.html',
  styles: ``
})
export class SituacionesIntervencionComponent {
  readonly dataIntervencionSituacion: DataModalIntervencionSituacion = inject(NZ_MODAL_DATA)
  intervencionEspacio: IntervencionEspacioResponse = this.dataIntervencionSituacion.intervencionEspacio

  loading: boolean = false

  pagination: Pagination = {
    columnSort: 'intervencionSituacionId',
    typeSort: 'DESC',
    pageSize: 5,
    currentPage: 1,
    total: 0
  }
  intervencionSituaciones = signal<IntervencionSituacionResponse[]>([])

  private intervencionSituacionService = inject(IntervencionSituacionService)

  obtenerIntervencionesSituaciones(){
    this.loading = true
    const intervencionId = this.intervencionEspacio.intervencionId
    this.intervencionSituacionService.ListarIntervencionTareaAvances({ ...this.pagination, intervencionId })
      .subscribe(resp => {
        this.loading = false
        this.intervencionSituaciones.set(resp.data)
        this.pagination.total = resp.info?.total
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    this.pagination.currentPage = params.pageIndex
    this.pagination.pageSize = params.pageSize
    this.obtenerIntervencionesSituaciones()
  }
}
