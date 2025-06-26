import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { InterfacePanelUbigeo } from '@core/interfaces/intervencion.interface';
import { CardComponent } from '@shared/card/card.component';

@Component({
  selector: 'app-intervencion-panel-mapa',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './intervencion-panel-mapa.component.html',
  styles: ``
})
export class IntervencionPanelMapaComponent {
  @Input() intervencionUbigeo: InterfacePanelUbigeo[] = []

  ngOnInit(): void {
  }

  
}
