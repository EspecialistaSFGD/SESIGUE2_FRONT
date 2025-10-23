import { Component, Input } from '@angular/core';
import { EntidadPanelResponse } from '@core/interfaces';

@Component({
  selector: 'app-mapa-panel-entidades',
  standalone: true,
  imports: [],
  templateUrl: './mapa-panel-entidades.component.html',
  styles: ``
})
export class MapaPanelEntidadesComponent {
  @Input() panelUbigeos: EntidadPanelResponse[] = [];
}
