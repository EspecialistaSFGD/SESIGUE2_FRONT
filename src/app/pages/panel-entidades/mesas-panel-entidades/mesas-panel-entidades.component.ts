import { Component, Input } from '@angular/core';
import { Pagination } from '@core/interfaces';

@Component({
  selector: 'app-mesas-panel-entidades',
  standalone: true,
  imports: [],
  templateUrl: './mesas-panel-entidades.component.html',
  styles: ``
})
export class MesasPanelEntidadesComponent {
  @Input() pagination: Pagination = {};
}
