import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { EntidadesPanelResponse, Pagination } from '@core/interfaces';
import { EntidadesService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { EventosPanelEntidadesComponent } from './eventos-panel-entidades/eventos-panel-entidades.component';
import { FiltroPanelEntidadesComponent } from './filtro-panel-entidades/filtro-panel-entidades.component';
import { MapaPanelEntidadesComponent } from './mapa-panel-entidades/mapa-panel-entidades.component';
import { MesasPanelEntidadesComponent } from './mesas-panel-entidades/mesas-panel-entidades.component';
import { UbigeoPanelEntidadesComponent } from './ubigeo-panel-entidades/ubigeo-panel-entidades.component';

@Component({
  selector: 'app-panel-entidades',
  standalone: true,
  imports: [CommonModule, NgZorroModule, FiltroPanelEntidadesComponent, MapaPanelEntidadesComponent, UbigeoPanelEntidadesComponent, MesasPanelEntidadesComponent, EventosPanelEntidadesComponent],
  templateUrl: './panel-entidades.component.html',
  styles: ``
})
export default class PanelEntidadesComponent {

  pagination: Pagination = {}
  filter = signal<Pagination>({})

  panelEntidades: EntidadesPanelResponse = {
    ubigeos: [],
    mesas: [],
    eventos: [],
  }

  private entidadService = inject(EntidadesService)

  ngOnInit(): void {
    this.obtenerPanelEntidadesService()
  }

  getFilterPagination(pagination: Pagination){
    this.pagination = pagination
    
    this.obtenerPanelEntidadesService()
  }

  obtenerPanelEntidadesService(){
    this.entidadService.PanelEntidad(this.pagination).subscribe( resp => this.panelEntidades = resp.data)
  }

  obtenerUbigeo(ubigeo: string){
    // this.pagination.ubigeo = ubigeo
    this.filter.update( f => ({
      ...f,
      ubigeo
    }))
    this.obtenerPanelEntidadesService()
  }
}
