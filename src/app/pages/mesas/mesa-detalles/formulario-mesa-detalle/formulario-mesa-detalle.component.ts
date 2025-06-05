import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { NzUploadFile } from 'ng-zorro-antd/upload';

@Component({
  selector: 'app-formulario-mesa-detalle',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule, NgZorroModule, PrimeNgModule],
  templateUrl: './formulario-mesa-detalle.component.html',
  styles: ``
})
export class FormularioMesaDetalleComponent {
  
  filesList: NzUploadFile[] = [];

  private fb = inject(FormBuilder)
  
  formMesaDetalle: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    archivo: ['', Validators.required],
    fechaCreacion: ['', Validators.required]
  })

  alertMessageError(control: string) {
    return this.formMesaDetalle.get(control)?.errors && this.formMesaDetalle.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formMesaDetalle.get(control)?.errors;

    return typeErrorControl(text, errors)
  }

  beforeUploadFile = (file: NzUploadFile): boolean => {
    const archivo = this.formMesaDetalle.get('archivo')
    archivo?.setValue(file)
    this.filesList = []
    this.filesList = this.filesList.concat(file);
    return false;
  };
}
