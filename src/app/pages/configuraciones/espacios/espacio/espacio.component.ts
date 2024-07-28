import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { OnlyNumbersDirective } from '../../../../libs/shared/directives/only-numbers.directive';
import { SectoresStore } from '../../../../libs/shared/stores/sectores.store';
import { SelectModel } from '../../../../libs/models/shared/select.model';
import { UtilesService } from '../../../../libs/shared/services/utiles.service';
import { EspaciosService } from '../../../../libs/services/espacios/espacios.service';
import { EspacioResponseModel } from '../../../../libs/models/shared/espacio.model';


@Component({
  selector: 'app-espacio',
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
  ],
  templateUrl: './espacio.component.html',
  styles: ``
})
export class EspacioComponent {
  espacioForm!: UntypedFormGroup;
  fechaDateFormat = 'dd/MM/yyyy';
  estadosSelect: SelectModel[] = [{ value: 1, label: 'Activo' }, { value: 0, label: 'Inactivo' }];

  private fb = inject(UntypedFormBuilder);
  public sectoresStore = inject(SectoresStore);
  private utilesService = inject(UtilesService);
  espaciosService = inject(EspaciosService);
  eventoSeleccionado: EspacioResponseModel = this.espaciosService.eventoSeleccionado();

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  constructor() {
    this.crearEspacioForm();
  }

  crearEspacioForm(): void {
    this.espacioForm = this.fb.group({
      eventoId: [this.eventoSeleccionado?.eventoId],
      nombre: [this.eventoSeleccionado?.nombre, [Validators.required]],
      abreviatura: [this.eventoSeleccionado?.abreviatura, [Validators.required]],
      // vigente: [this.eventoSeleccionado?.vigente],
      orden: [this.eventoSeleccionado?.orden, [Validators.required]],
      subTipo: [this.eventoSeleccionado?.subTipo],
      // estado: [this.eventoSeleccionado?.estadoSelect],
      fechaEvento: [this.eventoSeleccionado?.fechaEvento],
      fechaRegistro: [this.eventoSeleccionado?.fechaRegistro],
    });
  }
}
