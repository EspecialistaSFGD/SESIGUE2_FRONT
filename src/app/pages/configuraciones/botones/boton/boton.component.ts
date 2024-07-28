import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { OnlyNumbersDirective } from '../../../../libs/shared/directives/only-numbers.directive';
import { UtilesService } from '../../../../libs/shared/services/utiles.service';
import { IconPickerService } from '../../../../libs/shared/services/icon-picker.service';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { BotonesService } from '../../../../libs/services/configuraciones/botones.services';
import { PerfilBotonModel } from '../../../../libs/models/auth/perfil.model';

@Component({
  selector: 'app-boton',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzFormModule,
    NzInputModule,
    ReactiveFormsModule,
    NzGridModule,
    NzDatePickerModule,
    NzSelectModule,
    NzCheckboxModule,
    OnlyNumbersDirective,
    NzIconModule,
  ],
  templateUrl: './boton.component.html',
  styles: ``
})
export class BotonComponent {
  botonForm!: UntypedFormGroup;
  fechaDateFormat = 'dd/MM/yyyy';
  requiredLabel = 'Campo requerido';

  private fb = inject(UntypedFormBuilder);
  botonesService = inject(BotonesService);
  iconPickerService = inject(IconPickerService);
  botonSeleccionado: PerfilBotonModel = this.botonesService.botonSeleccionado();
  icons: string[] = [];

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  constructor() {
    this.crearBotonForm();
    this.icons = this.iconPickerService.getIcons();
  }

  crearBotonForm(): void {
    this.botonForm = this.fb.group({
      codigoBoton: [this.botonSeleccionado?.codigoBoton],
      descripcionBoton: [this.botonSeleccionado?.descripcionBoton, [Validators.required]],
      iconoBoton: [this.botonSeleccionado?.iconoBoton],
      ordenBoton: [this.botonSeleccionado?.ordenBoton, [Validators.required]],
    });
  }

}
