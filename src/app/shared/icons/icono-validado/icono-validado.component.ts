import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';

@Component({
  selector: 'app-icono-validado',
  standalone: true,
  imports: [CommonModule, NgZorroModule],
  templateUrl: './icono-validado.component.html',
  styles: ``
})
export class IconoValidadoComponent {
  @Input() validado: boolean = false;
}
