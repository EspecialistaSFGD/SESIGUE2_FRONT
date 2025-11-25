import { Component, Input } from '@angular/core';
import { PerfilResponse } from '@core/interfaces';

@Component({
  selector: 'app-perfil-detalle',
  standalone: true,
  imports: [],
  templateUrl: './perfil-detalle.component.html',
  styles: ``
})
export class PerfilDetalleComponent {
  @Input() perfil: PerfilResponse = {} as PerfilResponse
}
