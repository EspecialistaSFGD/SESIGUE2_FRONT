import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';

@Component({
  selector: 'app-indice-transferencia-recurso',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNgModule, NgZorroModule],
  templateUrl: './indice-transferencia-recurso.component.html',
  styles: ``
})
export class IndiceTransferenciaRecursoComponent {
  private fb = inject(FormBuilder)

  formIndice: FormGroup = this.fb.group({
    monto: [ '' ],
    fecha: [ '', Validators.required ],
    archivo:  [ '', Validators.required ]
  })

  ngOnInit(): void {
    
  }

  alertMessageError(control: string) {
    return this.formIndice.get(control)?.errors && this.formIndice.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formIndice.get(control)?.errors;

    return typeErrorControl(text, errors)
  }
}
