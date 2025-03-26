import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';

@Component({
  selector: 'app-aprobar-desestimacion',
  standalone: true,
  imports: [CommonModule, NgZorroModule, ReactiveFormsModule],
  templateUrl: './aprobar-desestimacion.component.html',
  styles: ``
})
export class AprobarDesestimacionComponent {
  private fb = inject(FormBuilder)

  formAprobarDesestimacion = this.fb.group({
    comentario: ['', Validators.required]
  })

  alertMessageError(control: string) {
    return this.formAprobarDesestimacion.get(control)?.errors && this.formAprobarDesestimacion.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
      const text = label ? label : control
      const errors = this.formAprobarDesestimacion.get(control)?.errors;
  
      return typeErrorControl(text, errors)
    }
}
