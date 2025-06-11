import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IntervencionTareaAvanceEstadoRegistroEnum } from '@core/enums';
import { convertEnumToObject, typeErrorControl } from '@core/helpers';
import { ItemEnum } from '@core/interfaces';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { NzUploadFile } from 'ng-zorro-antd/upload';

@Component({
  selector: 'app-formulario-intervencion-tarea-avance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNgModule, NgZorroModule],
  templateUrl: './formulario-intervencion-tarea-avance.component.html',
  styles: ``
})
export class FormularioIntervencionTareaAvanceComponent {

  estados: ItemEnum[] = convertEnumToObject(IntervencionTareaAvanceEstadoRegistroEnum, true)

  filesList: NzUploadFile[] = [];

  private fb = inject(FormBuilder)

  formTareaAvance: FormGroup = this.fb.group({
    avance: [ '', Validators.required ],
    fecha: [ '', Validators.required ],
    estadoRegistro: [ '', Validators.required ],
    evidencia: [ '' ]
  })

  alertMessageError(control: string) {
    return this.formTareaAvance.get(control)?.errors && this.formTareaAvance.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formTareaAvance.get(control)?.errors;

    return typeErrorControl(text, errors)
  }

  beforeUploadMeet = (file: NzUploadFile): boolean => {
    const archivo = this.formTareaAvance.get('evidencia')
    archivo?.setValue(file)
    this.filesList = []
    this.filesList = this.filesList.concat(file);
    return false;
  };
}
