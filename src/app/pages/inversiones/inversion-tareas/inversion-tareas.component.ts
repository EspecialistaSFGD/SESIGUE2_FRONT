import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-inversion-tareas',
  standalone: true,
  imports: [],
  templateUrl: './inversion-tareas.component.html',
  styles: ``
})
export default class InversionTareasComponent {
  @Input() inversionId!:string
}
