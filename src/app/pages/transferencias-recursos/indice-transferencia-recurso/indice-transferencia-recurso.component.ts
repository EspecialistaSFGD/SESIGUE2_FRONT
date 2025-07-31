import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { DataFile, TransferenciaRecursoIndiceFormData } from '@core/interfaces';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { BotonUploadComponent } from '@shared/boton/boton-upload/boton-upload.component';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-indice-transferencia-recurso',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNgModule, NgZorroModule, BotonUploadComponent],
  templateUrl: './indice-transferencia-recurso.component.html',
  styles: ``
})
export class IndiceTransferenciaRecursoComponent {
  readonly data: TransferenciaRecursoIndiceFormData = inject(NZ_MODAL_DATA);
  
  private fb = inject(FormBuilder)
  
  fileIndice: string = ''
  indice: boolean = this.data.indice

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

  getFiles(dataFile: DataFile) {
    if (dataFile.exist) {
      this.formIndice.patchValue({ archivo: dataFile.file! })

      const reader = new FileReader()
      reader.onload = () => this.fileIndice = reader.result as string
      reader.readAsDataURL(dataFile.file!)
    } else {
      this.formIndice.patchValue({ archivo: null })
    }
  }
}
