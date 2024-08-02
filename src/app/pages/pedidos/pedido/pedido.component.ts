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
import { PedidoModel } from '../../../libs/models/pedido';
import { PedidosService } from '../../../libs/services/pedidos/pedidos.service';
import { SelectModel } from '../../../libs/models/shared/select.model';
import { SectoresStore } from '../../../libs/shared/stores/sectores.store';
import { EspaciosStore } from '../../../libs/shared/stores/espacios.store';
import { PedidosStore } from '../../../libs/shared/stores/pedidos.store';
import { UbigeosStore } from '../../../libs/shared/stores/ubigeos.store';

@Component({
  selector: 'app-pedido',
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
  templateUrl: './pedido.component.html',
  styles: ``
})
export class PedidoComponent {
  pedidoForm!: UntypedFormGroup;
  fechaDateFormat = 'dd/MM/yyyy';

  pedidoService = inject(PedidosService);
  sectoresStore = inject(SectoresStore);
  espaciosStore = inject(EspaciosStore);
  pedidosStore = inject(PedidosStore);
  ubigeosStore = inject(UbigeosStore);
  private fb = inject(UntypedFormBuilder);

  pedidoSeleccionado: PedidoModel = this.pedidoService.pedidoSeleccionado();

  constructor() {
    this.crearPedidoForm();
  }

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  onEspacioChange(event: SelectModel): void {
    // const entidadControl = this.pedidoForm.get('entidad');
    // entidadControl?.reset();

    console.log(event);


    if (event === null) return;

    // this.entidadesStore.listarEntidades(0, 1, Number(event.value));

  }

  onEjeEstrategicoChange(event: SelectModel): void {
    if (event == null) return;
  }

  onTipoIntervencionChange(event: SelectModel): void {
    if (event == null) return;
  }

  onDepChange(value: SelectModel): void {
    const provControl = this.pedidoForm.get('provinciaSelect');

    provControl?.reset();

    if (value == null) return;

    this.ubigeosStore.listarProvincias(Number(value.value));
  }

  onProvChange(value: SelectModel): void {


    if (value == null) return;

  }

  crearPedidoForm(): void {
    this.pedidoForm = this.fb.group({
      prioridadID: [this.pedidoSeleccionado?.prioridadID],
      espacioSelect: [this.pedidoSeleccionado?.espacioSelect, [Validators.required]],
      sectorSelect: [this.pedidoSeleccionado?.sectorSelect],
      departamentoSelect: [this.pedidoSeleccionado?.departamentoSelect],
      provinciaSelect: [this.pedidoSeleccionado?.provinciaSelect],
      ejeEstrategicoSelect: [this.pedidoSeleccionado?.ejeEstrategicoSelect, [Validators.required]],
      tipoIntervencionSelect: [this.pedidoSeleccionado?.tipoIntervencionSelect, [Validators.required]],
      aspectoCriticoResolver: [this.pedidoSeleccionado?.aspectoCriticoResolver, [Validators.required]],
      cuis: [this.pedidoSeleccionado?.cuis],
    });
  }

}
