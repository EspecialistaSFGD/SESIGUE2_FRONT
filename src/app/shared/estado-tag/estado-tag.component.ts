import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { themeState } from '@core/helpers';
import { ColorEstados } from '@core/interfaces';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';

@Component({
  selector: 'app-estado-tag',
  standalone: true,
  imports: [CommonModule, NgZorroModule],
  templateUrl: './estado-tag.component.html',
  styles: ``
})
export class EstadoTagComponent {
  @Input() estado!:string

  getThemeState(): ColorEstados{
    return themeState(this.estado)
  }
}
