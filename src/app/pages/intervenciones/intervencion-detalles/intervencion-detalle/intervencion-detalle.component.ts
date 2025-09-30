import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IntervencionEspacioResponse } from '@core/interfaces';
import { PipesModule } from '@core/pipes/pipes.module';

@Component({
  selector: 'app-intervencion-detalle',
  standalone: true,
  imports: [CommonModule, PipesModule],
  templateUrl: './intervencion-detalle.component.html',
  styles: ``
})
export class IntervencionDetalleComponent {
  @Input() intervencionEspacio: IntervencionEspacioResponse = {} as IntervencionEspacioResponse
}
