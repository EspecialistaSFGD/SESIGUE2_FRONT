import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';

@Component({
  selector: 'app-formulario-mesa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-mesa.component.html',
  styles: ``
})
export class FormularioMesaComponent {

  private fb = inject(FormBuilder)

  formMesa: FormGroup = this.fb.group({
    nombre: ['', Validators.required]
  })

  alertMessageError(control: string) {
    return this.formMesa.get(control)?.errors && this.formMesa.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
      const text = label ? label : control
      const errors = this.formMesa.get(control)?.errors;
  
      return typeErrorControl(text, errors)
    }
}
