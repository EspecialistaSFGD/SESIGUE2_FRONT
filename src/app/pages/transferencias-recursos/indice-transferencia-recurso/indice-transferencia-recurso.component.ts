import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { DataFile, TransferenciaRecursoIndiceFormData } from '@core/interfaces';
import { ValidatorService } from '@core/services/validators';
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
  _data: TransferenciaRecursoIndiceFormData = inject(NZ_MODAL_DATA);

  @Input()
  set data(value: TransferenciaRecursoIndiceFormData) {
    this._data = value;
    if (!value.success) {
      this.resetFile = true;
      this.getFiles({ exist: false, file: undefined });
    }
  }

  get data() {
    return this._data;
  }
  
  private fb = inject(FormBuilder)
  private validatorSevice = inject(ValidatorService)
  
  resetFile: boolean = false
  indice: boolean = this.data.indice

  formIndice: FormGroup = this.fb.group({
    monto: [ '' ],
    fecha: [ '', Validators.required ],
    archivo:  [ '', Validators.required ]
  })
  
  alertMessageError(control: string) {
    return this.formIndice.get(control)?.errors && this.formIndice.get(control)?.touched
  }

  ngOnInit(): void {
    if(!this.indice){
      const monto = this.formIndice.get('monto')!
      monto.setValidators([Validators.required, Validators.pattern(this.validatorSevice.amountPattern)])
    }
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
      reader.readAsDataURL(dataFile.file!)
    } else {
      this.formIndice.patchValue({ archivo: null })
    }
  }

  formatNumber(){
    const montoControl = this.formIndice.get('monto');
    if (montoControl) {
      let value = montoControl.value;
      // Eliminar caracteres no numéricos, excepto el punto decimal
      value = value.replace(/[^0-9.]/g, '');
      // Asegurarse de que solo haya un punto decimal
      const parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
      }
      // Limitar a dos decimales
      let [integerPart, decimalPart] = value.split('.');
      // Formatear el número con separadores de miles
      const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

      montoControl.setValue(value)
      
      // montoControl.setValue(decimalPart !== undefined ? `${formattedIntegerPart}.${decimalPart}` : formattedIntegerPart);
    }
  }
}
