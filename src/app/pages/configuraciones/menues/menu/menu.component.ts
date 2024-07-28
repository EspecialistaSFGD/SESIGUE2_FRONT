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
import { MenuesService } from '../../../../libs/services/configuraciones/menues.service';
import { MenuModel } from '../../../../libs/models/shared/menu.model';
import { IconPickerService } from '../../../../libs/shared/services/icon-picker.service';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-menu',
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
  templateUrl: './menu.component.html',
  styles: ``
})
export class MenuComponent {
  menuForm!: UntypedFormGroup;
  fechaDateFormat = 'dd/MM/yyyy';
  requiredLabel = 'Campo requerido';

  private fb = inject(UntypedFormBuilder);
  private utilesService = inject(UtilesService);
  menuesService = inject(MenuesService);
  iconPickerService = inject(IconPickerService);
  menuSeleccionado: MenuModel = this.menuesService.menuSeleccionado();
  icons: string[] = [];


  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  constructor() {
    this.crearMenuForm();

    this.icons = this.iconPickerService.getIcons();
  }

  crearMenuForm(): void {
    this.menuForm = this.fb.group({
      codigoMenu: [this.menuSeleccionado?.codigoMenu],
      codigoMenuPadre: [this.menuSeleccionado?.codigoMenuPadre],
      direccionUrl: [this.menuSeleccionado?.direccionUrl],
      descripcionItem: [this.menuSeleccionado?.descripcionItem, [Validators.required]],
      iconoItem: [this.menuSeleccionado?.iconoItem],
      ordenItem: [this.menuSeleccionado?.ordenItem],
    });
  }

}
