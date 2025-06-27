import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { convertDateStringToDate, getDateFormat, typeErrorControl } from '@core/helpers';
import { DataModalMesa, MesaResponse } from '@core/interfaces';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzUploadFile } from 'ng-zorro-antd/upload';

@Component({
  selector: 'app-formulario-mesa-documento',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule, NgZorroModule, PrimeNgModule],
  templateUrl: './formulario-mesa-documento.component.html',
  styles: ``
})
export class FormularioMesaDocumentoComponent {

  readonly dataMesa: DataModalMesa = inject(NZ_MODAL_DATA);

  mesa: MesaResponse = this.dataMesa.mesa
  
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

  verificarFecha(){
    const mesaVigencia = convertDateStringToDate(this.mesa.fechaVigencia)
    const fechaDocumento = this.formMesaDocumento.get('fechaCreacion')?.value

    if (fechaDocumento && mesaVigencia) {
      const fechaDoc = new Date(fechaDocumento);
      const setError = fechaDoc <= mesaVigencia ? { msgBack: 'La fecha del documento debe ser mayor a la vigencia de la mesa.' } : null
      this.formMesaDocumento.get('fechaCreacion')?.setErrors(setError);
    }
  }
}
