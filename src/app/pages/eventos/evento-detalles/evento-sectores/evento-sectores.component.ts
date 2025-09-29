import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { EventoResponse, EventoSectorResponse, Pagination } from '@core/interfaces';
import { EventoSectoresService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-evento-sectores',
  standalone: true,
  imports: [CommonModule, NgZorroModule],
  templateUrl: './evento-sectores.component.html',
  styles: ``
})
export class EventoSectoresComponent {
  @Input() evento: EventoResponse = {} as EventoResponse
  @Input() esSsfgd: boolean = false

  loading: boolean = false
  pagination: Pagination = {
    columnSort: 'eventoSectorId',
    typeSort: 'DESC',
    pageSize: 5,
    currentPage: 1,
    total: 0
  }

  eventoSectores = signal<EventoSectorResponse[]>([])

  private eventoSectorService = inject(EventoSectoresService)

  ngOnInit(): void {
    this.pagination.eventoId = this.evento.eventoId
    // this.obtenerEventoSectoresService()
  }

  obtenerEventoSectoresService(){
    this.eventoSectorService.listarEventoSectores(this.pagination)
      .subscribe( resp => {        
        this.eventoSectores.set(resp.data)
        this.eventoSectores.set(resp.data)
        this.pagination.total = resp.info?.total        
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
      this.pagination.pageSize = params.pageSize
      this.pagination.currentPage = params.pageIndex
      this.obtenerEventoSectoresService()
  }
}
