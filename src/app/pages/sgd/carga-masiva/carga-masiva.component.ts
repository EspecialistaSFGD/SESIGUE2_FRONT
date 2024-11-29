import { Component } from '@angular/core';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';

@Component({
  selector: 'app-carga-masiva',
  standalone: true,
  imports: [
    PageHeaderComponent
  ],
  templateUrl: './carga-masiva.component.html',
  styles: ``
})
export default class CargaMasivaComponent {
  title: string = 'Carga masiva - SGD'
}
