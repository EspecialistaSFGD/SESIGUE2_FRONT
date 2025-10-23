import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { FiltroPanelEntidadesComponent } from './filtro-panel-entidades/filtro-panel-entidades.component';
import { Pagination } from '@core/interfaces';
import { MapaPanelEntidadesComponent } from './mapa-panel-entidades/mapa-panel-entidades.component';
import { UbigeoPanelEntidadesComponent } from './ubigeo-panel-entidades/ubigeo-panel-entidades.component';
import { MesasPanelEntidadesComponent } from './mesas-panel-entidades/mesas-panel-entidades.component';
import { EventosPanelEntidadesComponent } from './eventos-panel-entidades/eventos-panel-entidades.component';

@Component({
  selector: 'app-panel-entidades',
  standalone: true,
  imports: [CommonModule, NgZorroModule, FiltroPanelEntidadesComponent, MapaPanelEntidadesComponent, UbigeoPanelEntidadesComponent, MesasPanelEntidadesComponent, EventosPanelEntidadesComponent],
  templateUrl: './panel-entidades.component.html',
  styles: ``
})
export default class PanelEntidadesComponent {

  pagination: Pagination = {}

  getFilterPagination(pagination: Pagination){
    this.pagination = pagination
    console.log(pagination);
    
    // this.obtenerIntervencionPanelService()
  }
}
