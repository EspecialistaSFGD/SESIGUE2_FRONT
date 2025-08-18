import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';

@Component({
  selector: 'app-detalle-transferencia-recurso',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent],
  templateUrl: './detalle-transferencia-recurso.component.html',
  styles: ``
})
export default class DetalleTransferenciaRecursoComponent {

}
