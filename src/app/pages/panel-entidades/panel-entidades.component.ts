import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { FiltroPanelEntidadesComponent } from './filtro-panel-entidades/filtro-panel-entidades.component';
import { Pagination } from '@core/interfaces';

@Component({
  selector: 'app-panel-entidades',
  standalone: true,
  imports: [CommonModule, NgZorroModule, FiltroPanelEntidadesComponent],
  templateUrl: './panel-entidades.component.html',
  styles: ``
})
export default class PanelEntidadesComponent {

  pagination: Pagination = {}

  getFilterPagination(pagination: Pagination){
    this.pagination = pagination
    // this.obtenerIntervencionPanelService()
  }
}
