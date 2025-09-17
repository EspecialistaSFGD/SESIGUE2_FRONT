import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventoResponse, Pagination } from '@core/interfaces';
import { EventosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { EstadoTagComponent } from '@shared/estado-tag/estado-tag.component';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, RouterModule, NgZorroModule, EstadoTagComponent],
  templateUrl: './eventos.component.html',
  styles: ``
})
export default class EventosComponent {
  loading: boolean = false
  openFilters: boolean = false
  pagination: Pagination = {
    columnSort: 'eventoId',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  eventos = signal<EventoResponse[]>([])

  eventoService = inject(EventosService)

  ngOnInit(): void {
    this.obtenerEventoService()
  }

  obtenerEventoService(){
    this.loading = true
    this.eventoService.ListarEventos(this.pagination)
      .subscribe( resp => {
        this.eventos.set(resp.data)
        this.pagination.total = resp.info?.total
        this.loading = false
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    
  }

  crearEvento(){

  }
}
