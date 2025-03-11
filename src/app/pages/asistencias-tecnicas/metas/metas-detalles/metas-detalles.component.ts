import { Component, inject, Input } from '@angular/core';
import { MetaToDetails } from '@core/interfaces/meta.interface';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';


@Component({
  selector: 'app-metas-detalles',
  standalone: true,
  imports: [],
  templateUrl: './metas-detalles.component.html',
  styles: ``
})
export class MetasDetallesComponent {
  readonly meta: MetaToDetails = inject(NZ_MODAL_DATA);

  ngOnInit(): void {
    console.log(this.meta.usuarioId);
    
  }
}
