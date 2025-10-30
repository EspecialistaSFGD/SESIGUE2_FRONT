import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AccesoResponse, PerfilResponse } from '@core/interfaces';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';

@Component({
  selector: 'app-acceso-detalle-perfil',
  standalone: true,
  imports: [CommonModule, NgZorroModule],
  templateUrl: './acceso-detalle-perfil.component.html',
  styles: ``
})
export class AccesoDetallePerfilComponent {
  @Input() perfil: PerfilResponse = {} as PerfilResponse
  @Input() acceso: AccesoResponse = {} as AccesoResponse
}
