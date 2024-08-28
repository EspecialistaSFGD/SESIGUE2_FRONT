import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { OnlyNumbersDirective } from '../../../libs/shared/directives/only-numbers.directive';
import { EspaciosStore } from '../../../libs/shared/stores/espacios.store';
import { SelectModel } from '../../../libs/models/shared/select.model';
import { SectoresStore } from '../../../libs/shared/stores/sectores.store';
import { UbigeosStore } from '../../../libs/shared/stores/ubigeos.store';
import { EstadosStore } from '../../../libs/shared/stores/estados.store';

@Component({
  selector: 'app-reporte',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzFormModule,
    ReactiveFormsModule,
    NzInputModule,
    NzGridModule,
    NzDatePickerModule,
    NzSelectModule,
    NzCheckboxModule,
    OnlyNumbersDirective,
  ],
  templateUrl: './reporte.component.html',
  styles: ``
})
export class ReporteComponent {
  reporteForm!: UntypedFormGroup;
  requiredLabel: string = 'Campo requerido';
  depSeleccionado: SelectModel | null = null;
  provSeleccionada: SelectModel | null = null;

  private fb = inject(UntypedFormBuilder);
  espaciosStore = inject(EspaciosStore);
  sectoresStore = inject(SectoresStore);
  ubigeosStore = inject(UbigeosStore);
  estadosStore = inject(EstadosStore);

  constructor() {
    this.crearReporteForm();
  }

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  onEspacioChange(value: SelectModel): void {
    console.log(value);
  }

  onDepChange(value: SelectModel): void {
    this.reporteForm.get('provinciaSelect')?.reset();

    if (value && value.value) {
      this.ubigeosStore.listarProvincias(value.value?.toString());

      if (this.provSeleccionada != null) {
        this.provSeleccionada = null;
        this.reporteForm.patchValue({ prov: null });
      }
    }
  }

  onProvChange(value: SelectModel): void {
    this.provSeleccionada = value;
  }

  onEstadoAcuerdosChange(value: SelectModel): void { }

  onFechaInicioFinChange(value: Date[]): void {
    console.log(value);
  }

  crearReporteForm(): void {
    this.reporteForm = this.fb.group({
      fechaInicioFin: [null, [Validators.required]],
      // eventoSelect: [null],
      // sectorSelect: [null],
      // departamentoSelect: [null],
      // provinciaSelect: [null],
      // entidadSelect: [null],
      // estadoAcuerdoSelect: [null],
    });
  }
}
