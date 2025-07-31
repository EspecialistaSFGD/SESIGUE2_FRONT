import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Pagination, TransferenciaRecursoResponse } from '@core/interfaces';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { IndiceTransferenciaRecursoComponent } from './indice-transferencia-recurso/indice-transferencia-recurso.component';

@Component({
  selector: 'app-transferencias-recursos',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent, NgZorroModule],
  templateUrl: './transferencias-recursos.component.html',
  styles: ``
})
export default class TransferenciasRecursosComponent {

  loading: boolean = false
  
  pagination: Pagination = {
    columnSort: 'recursoId',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  transferencias = signal<TransferenciaRecursoResponse[]>([])
  
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private modal = inject(NzModalService)

  onQueryParamsChange(params: NzTableQueryParams): void {
    
  }

  agregarTransferenciaIndice(indice: boolean = true){
    const title = indice ? 'NUEVO INDICE' : 'NUEVA PROYECCIÓN'
    this.modal.create<IndiceTransferenciaRecursoComponent>({
      nzTitle: title,
      // nzWidth: '75%',
      nzMaskClosable: false,
      nzContent: IndiceTransferenciaRecursoComponent,
      nzData: {},
      nzFooter: [
        {
          label: 'Cancelar',
          type: 'default',
          onClick: () => this.modal.closeAll(),
        },
        {
          label: 'Guardar',
          type: 'primary',
          onClick: (componentResponse) => {
          }
        }
      ]
    })
  }
}