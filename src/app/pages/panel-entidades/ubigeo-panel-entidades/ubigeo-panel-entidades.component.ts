import { Component, Input } from '@angular/core';
import { Pagination } from '@core/interfaces';

@Component({
  selector: 'app-ubigeo-panel-entidades',
  standalone: true,
  imports: [],
  templateUrl: './ubigeo-panel-entidades.component.html',
  styles: ``
})
export class UbigeoPanelEntidadesComponent {
  @Input() pagination: Pagination = {};
}
