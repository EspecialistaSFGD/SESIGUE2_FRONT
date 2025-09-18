import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { EventoResponse } from '@core/interfaces';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { EstadoTagComponent } from '@shared/estado-tag/estado-tag.component';

@Component({
  selector: 'app-evento-detalle',
  standalone: true,
  imports: [CommonModule, NgZorroModule, EstadoTagComponent],
  templateUrl: './evento-detalle.component.html',
  styles: ``
})
export class EventoDetalleComponent {
  @Input() evento: EventoResponse = {} as EventoResponse
  @Input() esSsfgd: boolean = false
}
