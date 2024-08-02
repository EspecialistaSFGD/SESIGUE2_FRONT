import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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
export class AcuerdoComponent implements OnInit {
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

    // console.log(this.acuerdoSeleccionado?.tipoSelect);


    if (this.acuerdoSeleccionado?.responsableSelect != null) {
      this.onResponsableAcuerdosChange(this.acuerdoSeleccionado?.responsableSelect);
    }


  }

  ngOnInit(): void {
    const acuerdoModificadoCtrl = this.acuerdoForm.get('acuerdoModificado');
    const acuerdoCtrl = this.acuerdoForm.get('acuerdo');
    const preAcuerdoCtrl = this.acuerdoForm.get('pre_acuerdo');
    const es_preAcuerdoBoolCtrl = this.acuerdoForm.get('es_preAcuerdoBool');

    if (this.isConverting) {
      acuerdoModificadoCtrl?.setValidators([Validators.required]);
      es_preAcuerdoBoolCtrl?.patchValue(false);
    } else {
      acuerdoModificadoCtrl?.clearValidators();

      if (this.isCreatingPreAcuerdo) {
        acuerdoCtrl?.clearValidators();
        preAcuerdoCtrl?.setValidators([Validators.required]);
      } else {
        acuerdoCtrl?.setValidators([Validators.required]);
        preAcuerdoCtrl?.clearValidators();
      }
    }

    acuerdoModificadoCtrl?.updateValueAndValidity();
    acuerdoCtrl?.updateValueAndValidity();
    preAcuerdoCtrl?.updateValueAndValidity();
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
      prioridadId: [this.pedidoSeleccionado?.prioridadID, [Validators.required]],
      acuerdo: [(!this.isCreatingPreAcuerdo || this.isConverting) ? this.acuerdoSeleccionado?.acuerdo : null],
      pre_acuerdo: [(this.isCreatingPreAcuerdo || this.isConverting) ? this.acuerdoSeleccionado?.pre_acuerdo : null],
      clasificacionSelect: [this.acuerdoSeleccionado?.clasificacionSelect, [Validators.required]],
      responsableSelect: [this.acuerdoSeleccionado?.responsableSelect, [Validators.required]],
      entidadSelect: [this.acuerdoSeleccionado?.entidadSelect],
      tipoSelect: [this.acuerdoSeleccionado?.tipoSelect, [Validators.required]],
      plazo: [this.acuerdoSeleccionado?.plazo, [Validators.required]],
      es_preAcuerdoBool: (this.isCreatingPreAcuerdo != null ? this.isCreatingPreAcuerdo : this.acuerdoSeleccionado?.es_preAcuerdoBool),
      acuerdoModificado: [(this.acuerdoSeleccionado?.acuerdo) ? this.acuerdoSeleccionado?.acuerdo : this.acuerdoSeleccionado?.pre_acuerdo || null],
      //TODO: tener en cuenta para una edición especial del acuerdo
      acuerdo_original: [null],
      eventoId: [this.pedidoSeleccionado?.eventoId || null],
      // acuerdo_original: [this.acuerdoSeleccionado?.pre_Acuerdo],
    });
  }
}
