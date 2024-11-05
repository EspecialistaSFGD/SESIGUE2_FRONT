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
import { addYears, isBefore, isAfter, parseISO } from 'date-fns';
import { AddEditAcuerdoModel } from '../../../libs/models/shared/add-edit-acuerdo.model';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { UbigeosStore } from '../../../libs/shared/stores/ubigeos.store';
import { PedidosStore } from '../../../libs/shared/stores/pedidos.store';

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
  // fechaEvento: Date | null = null;
  requiredLabel: string = 'Campo requerido';


  nzModalData: AddEditAcuerdoModel = inject(NZ_MODAL_DATA);
  today = new Date();
  acuerdosService = inject(AcuerdosService);
  pedidosService = inject(PedidosService);
  sectoresStore = inject(SectoresStore);
  espaciosStore = inject(EspaciosStore);
  clasificacionesStore = inject(ClasificacionesStore);
  ubigeosStore = inject(UbigeosStore);
  pedidosStore = inject(PedidosStore);
  private fb = inject(UntypedFormBuilder);


  pedidoSeleccionado: PedidoModel | null = this.pedidosService.pedidoSeleccionado();
  acuerdoSeleccionado: AcuerdoPedidoModel | null = this.acuerdosService.acuerdoSeleccionado();

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  public fechaEvento = (this.pedidoSeleccionado?.fechaEvento != null) ? parseISO(this.pedidoSeleccionado?.fechaEvento.toString()) : null;
  public fechaFinEvento = (this.pedidoSeleccionado?.fechaFinEvento != null) ? parseISO(this.pedidoSeleccionado?.fechaFinEvento.toString()) : null;

  constructor() {
    this.crearAcuerdoForm();

    const acuerdoModificadoCtrl = this.acuerdoForm.get('acuerdoModificado');
    const acuerdoCtrl = this.acuerdoForm.get('acuerdo');
    const preAcuerdoCtrl = this.acuerdoForm.get('pre_acuerdo');
    const es_preAcuerdoBoolCtrl = this.acuerdoForm.get('es_preAcuerdoBool');

    const prioridadIdCtrl = this.acuerdoForm.get('prioridadId');
    const sectorCtrl = this.acuerdoForm.get('sectorSelect');
    const espacioCtrl = this.acuerdoForm.get('espacioSelect');

    if (this.nzModalData.tipo == 'PRE ACUERDO' && (this.nzModalData.accion == 'CREATE' || this.nzModalData.accion == 'EDIT')) {
      prioridadIdCtrl?.setValidators([Validators.required]);
      acuerdoCtrl?.clearValidators();
      acuerdoModificadoCtrl?.clearValidators();
      sectorCtrl?.clearValidators();
      preAcuerdoCtrl?.setValidators([Validators.required]);
      espacioCtrl?.clearValidators();
    }

    if (this.nzModalData.tipo == 'ACUERDO' && (this.nzModalData.accion == 'CREATE' || this.nzModalData.accion == 'EDIT')) {
      prioridadIdCtrl?.setValidators([Validators.required]);
      preAcuerdoCtrl?.clearValidators();
      acuerdoModificadoCtrl?.clearValidators();
      sectorCtrl?.clearValidators();
      acuerdoCtrl?.setValidators([Validators.required]);
      espacioCtrl?.clearValidators();
    }

    if (this.nzModalData.tipo == 'ACUERDO' && this.nzModalData.accion == 'RECREATE') {
      prioridadIdCtrl?.clearValidators();
      preAcuerdoCtrl?.clearValidators();
      acuerdoModificadoCtrl?.clearValidators();
      acuerdoCtrl?.setValidators([Validators.required]);
      sectorCtrl?.setValidators([Validators.required]);
      espacioCtrl?.setValidators([Validators.required]);
      es_preAcuerdoBoolCtrl?.patchValue(false);

    }

    if (this.nzModalData.tipo == 'ACUERDO' && this.nzModalData.accion == 'CONVERT') {
      prioridadIdCtrl?.setValidators([Validators.required]);
      acuerdoCtrl?.clearValidators();
      preAcuerdoCtrl?.clearValidators();
      sectorCtrl?.clearValidators();
      acuerdoModificadoCtrl?.setValidators([Validators.required]);
      es_preAcuerdoBoolCtrl?.patchValue(false);
    }

    prioridadIdCtrl?.updateValueAndValidity();
    acuerdoModificadoCtrl?.updateValueAndValidity();
    acuerdoCtrl?.updateValueAndValidity();
    preAcuerdoCtrl?.updateValueAndValidity();
    sectorCtrl?.updateValueAndValidity();
    espacioCtrl?.updateValueAndValidity();

    if (this.acuerdoSeleccionado?.responsableSelect != null) {
      this.onResponsableAcuerdosChange(this.acuerdoSeleccionado?.responsableSelect);
    }

    // if (this.pedidoSeleccionado?.fechaEvento != null) {
    //   this.fechaEvento = this.pedidoSeleccionado?.fechaEvento;
    // }
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

  onSectorChange(value: SelectModel): void { }

  onDepChange(value: SelectModel): void {
    const provControl = this.acuerdoForm.get('provinciaSelect');

    provControl?.reset();

    if (value == null) return;

    if (value.value) {
      this.ubigeosStore.listarProvincias(value.value.toString());
    }
  }

  onProvChange(value: SelectModel): void {
    if (value == null) return;

    const disCtrl = this.acuerdoForm.get('distritoSelect');
    disCtrl?.reset();

    if (value && value.value) {
      this.ubigeosStore.listarDistritos(value.value?.toString());
    }

  }

  onDisChange(value: SelectModel): void {

  }

  disabledDate = (current: Date): boolean => {
    // Si 'fechaEvento' es null, permitir todas las fechas
    if (!this.fechaEvento) {
      return false;
    }

    // Usar date-fns para agregar 2 años a 'fechaEvento'
    const fechaFinEvento = addYears(this.fechaEvento, 2);

    // Habilitar solo las fechas entre 'fechaEvento' y 'fechaFinEvento'
    return isBefore(current, this.fechaEvento) || isAfter(current, fechaFinEvento);
  }

  onEjeEstrategicoChange(event: SelectModel): void {
    if (event == null) return;
  }

  onTipoIntervencionChange(event: SelectModel): void {
    if (event == null) return;
  }

  onCodigoChange(codigo: any) {
    if (codigo == null) return;

    const cuisControl = this.acuerdoForm.get('cuis');
    cuisControl?.reset();

    switch (Number(codigo)) {
      case 1:
        cuisControl?.clearValidators();
        break;
      case 2:
        cuisControl?.setValidators([Validators.required, Validators.pattern(/^[0-9]{1,7}$/)]);
        break;
      case 3:
        cuisControl?.setValidators([Validators.required, Validators.pattern(/^[0-9]{1,6}$/)]);
        break;
      default:
        break;
    }

    cuisControl?.updateValueAndValidity();
  }

  onEspacioChange(event: SelectModel): void {
    // const entidadControl = this.pedidoForm.get('entidad');
    // entidadControl?.reset();

    // console.log(event);

    if (event === null) return;

    // this.entidadesStore.listarEntidades(0, 1, Number(event.value));

  }


  crearAcuerdoForm(): void {
    const preAcuerdoValue = this.acuerdoSeleccionado?.pre_acuerdo;

    this.acuerdoForm = this.fb.group({
      acuerdoId: [this.acuerdoSeleccionado?.acuerdoId],
      prioridadId: [this.pedidoSeleccionado?.prioridadID],
      acuerdo: [this.nzModalData.accion === 'CONVERT' ? preAcuerdoValue : this.acuerdoSeleccionado?.acuerdo], // Si la condición se cumple, usamos pre_acuerdo
      pre_acuerdo: [{
        value: preAcuerdoValue,
        disabled: this.nzModalData.accion === 'CONVERT'  // Condición para deshabilitar
      }],
      clasificacionSelect: [this.acuerdoSeleccionado?.clasificacionSelect, [Validators.required]],
      responsableSelect: [this.acuerdoSeleccionado?.responsableSelect, [Validators.required]],
      entidadSelect: [this.acuerdoSeleccionado?.entidadSelect],
      tipoSelect: [this.acuerdoSeleccionado?.tipoSelect || "1", [Validators.required]],
      plazo: [this.acuerdoSeleccionado?.plazo, [Validators.required]],
      es_preAcuerdoBool: [(this.nzModalData.tipo == 'PRE ACUERDO' ? true : false)],
      acuerdoModificado: [(this.nzModalData.accion == 'CONVERT' ? this.acuerdoSeleccionado?.pre_acuerdo : null)],
      //TODO: tener en cuenta para una edición especial del acuerdo
      acuerdo_original: [null],
      eventoId: [(this.nzModalData.accion == 'RECREATE') ? null : this.pedidoSeleccionado?.eventoId],
      espacioSelect: [null],
      sectorSelect: [null],
      tipoCodigoSelect: [null],
      cuis: [null],
      departamentoSelect: [this.pedidoSeleccionado?.departamentoSelect],
      provinciaSelect: [this.pedidoSeleccionado?.provinciaSelect],
      distritoSelect: [this.pedidoSeleccionado?.distritoSelect],
      aspectoCriticoResolver: [null],
      ejeEstrategicoSelect: [null],
      tipoIntervencionSelect: [null],
    });
  }
}
