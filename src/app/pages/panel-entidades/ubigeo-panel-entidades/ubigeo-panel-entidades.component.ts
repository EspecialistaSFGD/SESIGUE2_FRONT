import { Component, Input } from '@angular/core';
import { EntidadPanelResponse } from '@core/interfaces';

@Component({
  selector: 'app-ubigeo-panel-entidades',
  standalone: true,
  imports: [],
  templateUrl: './ubigeo-panel-entidades.component.html',
  styles: ``
})
export class UbigeoPanelEntidadesComponent {
  @Input() panelUbigeos: EntidadPanelResponse[] = [];
}
