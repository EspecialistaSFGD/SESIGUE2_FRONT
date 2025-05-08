import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { HitosService } from '../../../services/pedidos/hitos.service';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { ComentarioModel } from '../../../models/pedido/comentario.model';

@Component({
  selector: 'app-comentario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzFormModule,
    NzInputModule,
    ReactiveFormsModule,
    NzGridModule,
  ],
  templateUrl: './comentario.component.html',
  styles: ``
})
export class ComentarioComponent {
  comentarioForm!: UntypedFormGroup;
  readonly nzModalData: ComentarioModel = inject(NZ_MODAL_DATA);

  private fb = inject(UntypedFormBuilder);
  public hitosService = inject(HitosService);

  cantidadCaracteresComentario = 500

  constructor() {
    this.crearComentarioForm();
  }

  crearComentarioForm(): void {
    this.comentarioForm = this.fb.group({
      id: [this.nzModalData.id, [Validators.required]],
      tipo: [this.nzModalData.tipo, [Validators.required]],
      tipoComentario: [this.nzModalData.tipoComentario, [Validators.required]],
      comentario: [null, [Validators.required]],
    });
  }

  caracteresContador(qty: number) {
    const element = this.comentarioForm.get('comentario')
    const value = element?.value    
    if(value){
      if (value.length > qty) {
        const newValue = value.substring(0, qty);
        element?.setValue(newValue)
      }
      this.cantidadCaracteresComentario = qty - value.length;
    }
    
  }
}
