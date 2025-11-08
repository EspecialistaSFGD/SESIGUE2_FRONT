import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';

@Component({
  selector: 'app-perfil-detalles',
  standalone: true,
  imports: [CommonModule, NgZorroModule],
  templateUrl: './perfil-detalles.component.html',
  styles: ``
})
export default class PerfilDetallesComponent {
}
