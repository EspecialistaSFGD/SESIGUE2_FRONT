import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';

@Component({
  selector: 'app-formulario-mesa-estado-resumen',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNgModule],
  templateUrl: './formulario-mesa-estado-resumen.component.html',
  styles: ``
})
export class FormularioMesaEstadoResumenComponent {
  private fb = inject(FormBuilder)

  formEstado: FormGroup = this.fb.group({
    fechaRegistro: ['', Validators.required],
    comentario: ['', Validators.required]
  })

  alertMessageError(control: string) {
    return this.formEstado.get(control)?.errors && this.formEstado.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formEstado.get(control)?.errors;

    return typeErrorControl(text, errors)
  }
}
