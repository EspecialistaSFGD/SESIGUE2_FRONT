import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ParametroTipoEnum } from '@core/enums';
import { convertEnumToObject, typeErrorControl } from '@core/helpers';
import { DataFormularioParametro, ItemEnum } from '@core/interfaces';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-formulario-parametro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNgModule],
  templateUrl: './formulario-parametro.component.html',
  styles: ``
})
export class FormularioParametroComponent {
  readonly dataParametro: DataFormularioParametro = inject(NZ_MODAL_DATA)

  tipos: ItemEnum[] = convertEnumToObject(ParametroTipoEnum, true)

  private fb = inject(FormBuilder)

  formParametro:FormGroup = this.fb.group({
    nombre: [null, Validators.required],
    valorTexto: [null, Validators.required],
    valorEntero: [0, Validators.required],
    descripcion: [null, Validators.required],
    tipo: [null, Validators.required],
  })

  ngOnInit(): void {
    if(!this.dataParametro.create){   
      this.formParametro.reset({ ...this.dataParametro.parametro })
    }
  }

  alertMessageError(control: string) {
    return this.formParametro.get(control)?.errors && this.formParametro.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formParametro.get(control)?.errors;

    return typeErrorControl(text, errors)
  }
}
