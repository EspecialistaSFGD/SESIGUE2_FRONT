import { Component, Input } from '@angular/core';
import { EntidadPanelResponse } from '@core/interfaces';

@Component({
  selector: 'app-eventos-panel-entidades',
  standalone: true,
  imports: [],
  templateUrl: './eventos-panel-entidades.component.html',
  styles: ``
})
export class EventosPanelEntidadesComponent {
  @Input() panelEventos: EntidadPanelResponse[] = [];
}
