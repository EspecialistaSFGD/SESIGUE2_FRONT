import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import InversionTareasComponent from '../inversion-tareas/inversion-tareas.component';

@Component({
  selector: 'app-inversion-detalle',
  standalone: true,
  imports: [CommonModule, NgZorroModule, InversionTareasComponent],
  templateUrl: './inversion-detalle.component.html',
  styles: ``
})
export default class InversionDetalleComponent {
  title: string = `Intervención de la mesa`;
}
