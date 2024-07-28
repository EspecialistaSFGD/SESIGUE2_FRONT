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
import { PerfilAccesoModel, PerfilBotonModel } from '../../../../libs/models/auth/perfil.model';
import { AccesosService } from '../../../../libs/services/configuraciones/accesos.services';

@Component({
  selector: 'app-acceso',
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
  templateUrl: './acceso.component.html',
  styles: ``
})
export class AccesoComponent {
  accesoForm!: UntypedFormGroup;
  fechaDateFormat = 'dd/MM/yyyy';
  requiredLabel = 'Campo requerido';

  private fb = inject(UntypedFormBuilder);
  accesosService = inject(AccesosService);
  iconPickerService = inject(IconPickerService);
  accesoSeleccionado: PerfilAccesoModel = this.accesosService.accesoSeleccionado();
  icons: string[] = [];

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  constructor() {
    this.crearBotonForm();
    this.icons = this.iconPickerService.getIcons();
  }

  crearBotonForm(): void {
    this.accesoForm = this.fb.group({
      codigoAcceso: [this.accesoSeleccionado?.codigoAcceso],
      codigoPerfil: [this.accesoSeleccionado?.codigoPerfil],
      codigoMenu: [this.accesoSeleccionado?.codigoMenu],
    });
  }

}
