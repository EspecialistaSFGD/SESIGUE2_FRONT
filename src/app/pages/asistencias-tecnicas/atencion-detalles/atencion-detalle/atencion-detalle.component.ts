import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AsistenciaTecnicaResponse } from '@core/interfaces';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { BotonDescargarComponent } from '@shared/boton/boton-descargar/boton-descargar.component';

@Component({
  selector: 'app-atencion-detalle',
  standalone: true,
  imports: [CommonModule, NgZorroModule, BotonDescargarComponent],
  templateUrl: './atencion-detalle.component.html',
  styles: ``
})
export class AtencionDetalleComponent {
  @Input() asistenciaTecnica: AsistenciaTecnicaResponse = {} as AsistenciaTecnicaResponse
}
