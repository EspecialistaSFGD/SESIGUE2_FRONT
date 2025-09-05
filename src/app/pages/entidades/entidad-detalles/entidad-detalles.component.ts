import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';

@Component({
  selector: 'app-entidad-detalles',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './entidad-detalles.component.html',
  styles: ``
})
export default class EntidadDetallesComponent {

}
