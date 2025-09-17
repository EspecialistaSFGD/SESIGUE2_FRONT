import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { AsistenciaTecnicaAgendaResponse, AsistenciaTecnicaResponse, Pagination } from '@core/interfaces';
import { AsistenciaTecnicaAgendasService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-agendas-atencion',
  standalone: true,
  imports: [CommonModule, NgZorroModule],
  templateUrl: './agendas-atencion.component.html',
  styles: ``
})
export class AgendasAtencionComponent {
  @Input() asistenciaTecnica: AsistenciaTecnicaResponse = {} as AsistenciaTecnicaResponse
  
    loading: boolean = false
  
    pagination: Pagination = {
      code: 0,
      columnSort: 'agendaId',
      typeSort: 'ASC',
      pageSize: 10,
      currentPage: 1,
      total: 0
    }
  
    agendas = signal<AsistenciaTecnicaAgendaResponse[]>([])
    
    private asistenciaTecnicaAgendaService = inject(AsistenciaTecnicaAgendasService)
  
    obtenerAgendas() {
      this.loading = true
      this.asistenciaTecnicaAgendaService.getAllAgendas(this.asistenciaTecnica.asistenciaId!, this.pagination)
        .subscribe(resp => {        
          this.agendas.set(resp.data)
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
      this.obtenerAgendas()
    }
}
