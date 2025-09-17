import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { EntidadResponse } from '@core/interfaces';

@Component({
  selector: 'app-entidad-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './entidad-detalle.component.html',
  styles: ``
})
export class EntidadDetalleComponent {
  @Input() entidad: EntidadResponse = {} as EntidadResponse
  @Input() esSsfgd: boolean = false
}
