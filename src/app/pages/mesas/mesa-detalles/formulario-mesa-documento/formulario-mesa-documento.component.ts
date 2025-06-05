import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { NzUploadFile } from 'ng-zorro-antd/upload';

@Component({
  selector: 'app-formulario-mesa-documento',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule, NgZorroModule, PrimeNgModule],
  templateUrl: './formulario-mesa-documento.component.html',
  styles: ``
})
export class FormularioMesaDocumentoComponent {
  
  filesList: NzUploadFile[] = [];

  private fb = inject(FormBuilder)
  
  formMesaDocumento: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    archivo: ['', Validators.required],
    fechaCreacion: ['', Validators.required]
  })

  alertMessageError(control: string) {
    return this.formMesaDocumento.get(control)?.errors && this.formMesaDocumento.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formMesaDocumento.get(control)?.errors;

    return typeErrorControl(text, errors)
  }

  beforeUploadFile = (file: NzUploadFile): boolean => {
    const archivo = this.formMesaDocumento.get('archivo')
    archivo?.setValue(file)
    this.filesList = []
    this.filesList = this.filesList.concat(file);
    return false;
  };
}
