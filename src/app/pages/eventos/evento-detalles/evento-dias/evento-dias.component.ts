import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { EventoDiaResponse, EventoResponse, Pagination } from '@core/interfaces';
import { EventoDiasService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { BotonComponent } from '@shared/boton/boton/boton.component';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-evento-dias',
  standalone: true,
  imports: [CommonModule, NgZorroModule, BotonComponent],
  templateUrl: './evento-dias.component.html',
  styles: ``
})
export class EventoDiasComponent {
  @Input() evento!: EventoResponse;
  
  loading: boolean = false
  eventoDias = signal<EventoDiaResponse[]>([]);

  pagination: Pagination = {
    columnSort: 'diaEventoId',
    typeSort: 'asc',
    currentPage: 1,
    pageSize: 10
  }

  private eventoDiaService = inject(EventoDiasService)

  ngOnInit(): void {
    this.obtenerDiasEvento()
  }

  obtenerDiasEvento(){
    this.loading = true
    this.pagination.eventoId = this.evento.eventoId?.toString()
    this.eventoDiaService.ListarEventoDias(this.pagination)
      .subscribe( resp => {
        this.loading = false
        this.eventoDias.set(resp.data);
        this.pagination.total = resp.info?.total
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    
  }

  actualizarDiaEvento(diaEvento: EventoDiaResponse){

  }
}
