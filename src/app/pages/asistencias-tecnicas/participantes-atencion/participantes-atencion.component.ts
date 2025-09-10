import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal, SimpleChanges } from '@angular/core';
import { AsistenciaTecnicaParticipanteResponse, AsistenciaTecnicaResponse, Pagination } from '@core/interfaces';
import { AsistenciaTecnicaParticipantesService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-participantes-atencion',
  standalone: true,
  imports: [CommonModule, NgZorroModule],
  templateUrl: './participantes-atencion.component.html',
  styles: ``
})
export class ParticipantesAtencionComponent {
  @Input() asistenciaTecnica: AsistenciaTecnicaResponse = {} as AsistenciaTecnicaResponse

  loading: boolean = false

  pagination: Pagination = {
    code: 0,
    columnSort: 'participanteId',
    typeSort: 'ASC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  participantes = signal<AsistenciaTecnicaParticipanteResponse[]>([])
  
  private asistenciaTecnicaParticipanteService = inject(AsistenciaTecnicaParticipantesService)

  obtenerParticipantes() {
    this.loading = true
    this.asistenciaTecnicaParticipanteService.getAllParticipantes(this.asistenciaTecnica.asistenciaId!, this.pagination)
      .subscribe(resp => {        
        this.participantes.set(resp.data)
        this.pagination.total = resp.info?.total
        this.loading = false
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const sortsNames = ['ascend', 'descend']
    const sorts = params.sort.find(item => sortsNames.includes(item.value!))
    const qtySorts = params.sort.reduce((total, item) => {
      return sortsNames.includes(item.value!) ? total + 1 : total
    }, 0)
    const campo = sorts?.key
    const ordenar = sorts?.value!.slice(0, -3)
    
    this.pagination.pageSize = params.pageSize
    this.pagination.currentPage = params.pageIndex
    this.obtenerParticipantes()
  }
}
