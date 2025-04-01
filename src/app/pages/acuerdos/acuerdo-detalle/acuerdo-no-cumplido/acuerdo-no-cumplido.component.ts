import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';

@Component({
  selector: 'app-acuerdo-no-cumplido',
  standalone: true,
  imports: [CommonModule, NgZorroModule, ReactiveFormsModule],
  templateUrl: './acuerdo-no-cumplido.component.html',
  styles: ``
})
export class AcuerdoNoCumplidoComponent {
  private fb = inject(FormBuilder)
  
  formCumplimiento = this.fb.group({
    comentario: ['', Validators.required],
    codigo: [''],
    acuerdoReasignado: ['']
  })

  alertMessageError(control: string) {
    return this.formCumplimiento.get(control)?.errors && this.formCumplimiento.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
      const text = label ? label : control
      const errors = this.formCumplimiento.get(control)?.errors;
  
      return typeErrorControl(text, errors)
    }
}
