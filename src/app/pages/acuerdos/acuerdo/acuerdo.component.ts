import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { OnlyNumbersDirective } from '../../../libs/shared/directives/only-numbers.directive';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { AcuerdoPedidoModel, PedidoModel } from '../../../libs/models/pedido';
import { PedidosService } from '../../../libs/services/pedidos/pedidos.service';
import { SelectModel } from '../../../libs/models/shared/select.model';
import { SectoresStore } from '../../../libs/shared/stores/sectores.store';
import { EspaciosStore } from '../../../libs/shared/stores/espacios.store';
import { AcuerdosService } from '../../../libs/services/pedidos/acuerdos.service';
import { ClasificacionesStore } from '../../../libs/shared/stores/clasificaciones.store';
import { differenceInCalendarDays } from 'date-fns';

@Component({
  selector: 'app-acuerdo',
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
  templateUrl: './acuerdo.component.html',
  styles: ``
})
export class AcuerdoComponent {
  acuerdoForm!: UntypedFormGroup;
  fechaDateFormat = 'dd/MM/yyyy';

  acuerdosService = inject(AcuerdosService);
  pedidosService = inject(PedidosService);
  sectoresStore = inject(SectoresStore);
  espaciosStore = inject(EspaciosStore);
  clasificacionesStore = inject(ClasificacionesStore);
  private fb = inject(UntypedFormBuilder);

  pedidoSeleccionado: PedidoModel | null = this.pedidosService.pedidoSeleccionado();

  acuerdoSeleccionado: AcuerdoPedidoModel | null = this.acuerdosService.acuerdoSeleccionado();

  isCreatingPreAcuerdo: boolean | null = this.acuerdosService.isCreatingPreAcuerdo();

  isConverting: boolean | null = this.acuerdosService.isConverting();

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);


  constructor() {
    this.crearAcuerdoForm();

    if (this.acuerdoSeleccionado?.responsableSelect != null) {
      this.onResponsableAcuerdosChange(this.acuerdoSeleccionado?.responsableSelect);
    }
  }

  onClasificacionAcuerdosChange(value: SelectModel): void {
    console.log(value);

  }

  onResponsableAcuerdosChange(tipo: SelectModel): void {

    if (tipo == null || this.acuerdoSeleccionado?.acuerdoId == null) return;
    this.sectoresStore.listarEntidadesResponsables(Number(tipo.value), this.acuerdoSeleccionado?.acuerdoId);
  }

  onEntidadIDChange(value: SelectModel): void {
    console.log(value);

  }

  onTipoAcuerdosChange(value: any) {
    console.log('onTipoAcuerdosChange', { value });
  }

  disabledDate = (current: Date): boolean => {
    // if (this.plazo == null) return false;

    // return differenceInCalendarDays(current, this.plazo) > 0;

    return false;
  }

  crearAcuerdoForm(): void {
    this.acuerdoForm = this.fb.group({
      acuerdoId: [this.acuerdoSeleccionado?.acuerdoId],
      prioridadId: [this.pedidoSeleccionado?.prioridadID],
      acuerdo: [this.acuerdoSeleccionado?.acuerdo, [Validators.required]],
      clasificacionSelect: [this.acuerdoSeleccionado?.clasificacionSelect],
      responsableSelect: [this.acuerdoSeleccionado?.responsableSelect],
      entidadSelect: [this.acuerdoSeleccionado?.entidadSelect],
      tipoSelect: [this.acuerdoSeleccionado?.tipoSelect],
      plazo: [this.acuerdoSeleccionado?.plazo],
      pre_Acuerdo: [this.acuerdoSeleccionado?.pre_Acuerdo],
      es_preAcuerdo: (this.isCreatingPreAcuerdo != null ? this.isCreatingPreAcuerdo : this.acuerdoSeleccionado?.es_preAcuerdo),
      acuerdoModificado: [this.acuerdoSeleccionado?.acuerdoModificado],
      acuerdo_original: [this.acuerdoSeleccionado?.acuerdo_original],
    });
  }
}
