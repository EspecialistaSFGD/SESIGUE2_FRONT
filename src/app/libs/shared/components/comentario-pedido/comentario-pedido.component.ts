import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { PedidosService } from '../../../services/pedidos/pedidos.service';

@Component({
  selector: 'app-comentario-pedido',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzFormModule,
    NzInputModule,
    ReactiveFormsModule,
    NzGridModule,
  ],
  templateUrl: './comentario-pedido.component.html',
  styles: ``
})
export class ComentarioPedidoComponent {
  comentarioPcmForm!: UntypedFormGroup;

  private fb = inject(UntypedFormBuilder);
  public pedidosService = inject(PedidosService);

  pedidoSeleccionado = this.pedidosService.pedidoSeleccionado();

  constructor() {
    this.crearComentarioPcmForm();
  }

  crearComentarioPcmForm(): void {
    this.comentarioPcmForm = this.fb.group({
      prioridadID: [this.pedidoSeleccionado?.prioridadID, [Validators.required]],
      comentarioPcm: [this.pedidoSeleccionado?.comentarioPcm, [Validators.required]],
    });
  }
}
