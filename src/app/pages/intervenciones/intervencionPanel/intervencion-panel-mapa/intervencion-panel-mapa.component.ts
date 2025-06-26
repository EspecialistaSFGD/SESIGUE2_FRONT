import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CardComponent } from '@shared/card/card.component';

@Component({
  selector: 'app-intervencion-panel-mapa',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './intervencion-panel-mapa.component.html',
  styles: ``
})
export class IntervencionPanelMapaComponent {

}
