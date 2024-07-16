import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { HitosService } from '../../../services/pedidos/hitos.service';

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
  styleUrl: './comentario.component.less'
})
export class ComentarioComponent {
  comentarioForm!: UntypedFormGroup;

  private fb = inject(UntypedFormBuilder);
  public hitosService = inject(HitosService);
  private hitoSeleccionado = this.hitosService.hitoSeleccionado();

  constructor() {
    this.crearComentarioForm();

    console.log(this.hitoSeleccionado);

  }

  crearComentarioForm(): void {
    this.comentarioForm = this.fb.group({
      hitoId: [this.hitoSeleccionado?.hitoId, [Validators.required]],
      comentario: [null, [Validators.required]],
    });
  }
}
