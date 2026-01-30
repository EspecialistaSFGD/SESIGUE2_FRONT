import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { EventoDiaResponse } from '@core/interfaces';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-formulario-evento-dias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNgModule],
  templateUrl: './formulario-evento-dias.component.html',
  styles: ``
})
export class FormularioEventoDiasComponent {

  readonly dataDiaEvento:EventoDiaResponse = inject(NZ_MODAL_DATA);

  private fb = inject(FormBuilder)

  formDiaEvento:FormGroup = this.fb.group({
    plenaria: [false, Validators.required],
    cantidadSector: [0, Validators.required],
    cantidadRegionalLocal: [0, Validators.required],
  })

  ngOnInit(): void {    
    this.formDiaEvento.reset({ ...this.dataDiaEvento });
  }

  alertMessageError(control: string) {
    return this.formDiaEvento.get(control)?.errors && this.formDiaEvento.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formDiaEvento.get(control)?.errors;

    return typeErrorControl(text, errors)
  }
}
