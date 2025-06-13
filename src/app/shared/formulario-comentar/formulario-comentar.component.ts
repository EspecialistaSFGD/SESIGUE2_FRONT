import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';

@Component({
  selector: 'app-formulario-comentar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-comentar.component.html',
  styles: ``
})
export class FormularioComentarComponent {

  maxChar:number = 500
  cantidadCaracteresTarea = this.maxChar
  
  private fb = inject(FormBuilder)

  formComentario: FormGroup = this.fb.group({
    comentario: [ '', Validators.required ]
  })

  alertMessageError(control: string) {
      return this.formComentario.get(control)?.errors && this.formComentario.get(control)?.touched
    }
  
  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formComentario.get(control)?.errors;

    return typeErrorControl(text, errors)
  }

  caracteresContador() {
    const element = this.formComentario.get('comentario')
    const value = element?.value    
    if(value){
      if (value.length > this.maxChar) {
        const newValue = value.substring(0, this.maxChar);
        element?.setValue(newValue)
      }
      this.cantidadCaracteresTarea = this.maxChar - value.length;
    }
  }

}
