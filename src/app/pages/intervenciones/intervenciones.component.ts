import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';

@Component({
  selector: 'app-intervenciones',
  standalone: true,
  imports: [CommonModule, NgZorroModule],
  templateUrl: './intervenciones.component.html',
  styles: ``
})
export default class IntervencionesComponent {
  title: string = `Intervenciones`;
}
