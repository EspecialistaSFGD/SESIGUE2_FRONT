import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
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
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { PedidoType } from '../../../libs/shared/types/pedido.type';
import { AuthService } from '../../../libs/services/auth/auth.service';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { AcuerdosService } from '@core/services';
import { AcuerdoResponse, Pagination } from '@core/interfaces';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // NzFormModule,
    ReactiveFormsModule,
    // NzInputModule,
    // NzGridModule,
    // NzDatePickerModule,
    // NzSelectModule,
    // NzCheckboxModule,
    OnlyNumbersDirective,
    NgZorroModule
  ],
  templateUrl: './pedido.component.html',
  styles: ``
})
export class PedidoComponent {
  pedidoForm!: UntypedFormGroup;
  requiredLabel: string = 'Campo requerido';
  readonly nzModalData: PedidoType = inject(NZ_MODAL_DATA);

  fechaDateFormat = 'dd/MM/yyyy';

  pedidoService = inject(PedidosService);
  sectoresStore = inject(SectoresStore);
  espaciosStore = inject(EspaciosStore);
  pedidosStore = inject(PedidosStore);
  ubigeosStore = inject(UbigeosStore);
  authService = inject(AuthService);
  private fb = inject(UntypedFormBuilder);

  acuerdos = signal<AcuerdoResponse[]>([])

  loadingAcuerdos: boolean = false
  paginationAcuerdos: Pagination = {
    columnSort: 'eventoId',
    typeSort: 'DESC',
    pageSize: 5,
    currentPage: 1
  }
  private acuerdosService = inject(AcuerdosService)

  pedidoSeleccionado: PedidoModel | null = this.pedidoService.pedidoSeleccionado();

  public fechaEvento = (this.pedidoSeleccionado?.fechaEvento != null) ? parseISO(this.pedidoSeleccionado?.fechaEvento.toString()) : null;

  constructor() {
    this.sectoresStore.listarSectores(0, 2, 1)
    this.crearPedidoForm();

    if (this.nzModalData == 'SECTOR') {
      this.pedidoForm.get('sectorSelect')?.patchValue(this.authService.sector());
    } else {
      this.pedidoForm.get('departamentoSelect')?.patchValue(this.authService.departamento());
      this.pedidoForm.get('provinciaSelect')?.patchValue(this.authService.provincia());
      this.pedidoForm.get('distritoSelect')?.patchValue(this.authService.distrito());
    }

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

    if (value.value) {
      this.ubigeosStore.listarProvincias(value.value.toString());
    }

  }

  onProvChange(value: SelectModel): void {
    if (value == null) return;

    const disCtrl = this.pedidoForm.get('distritoSelect');
    disCtrl?.reset();

    if (value && value.value) {
      this.ubigeosStore.listarDistritos(value.value?.toString());
    }

  }

  onDisChange(value: SelectModel): void {

  }

  onCodigoChange(codigo: any) {
    if (codigo == null) return;

    const cuisControl = this.pedidoForm.get('cuis');
    cuisControl?.reset();

    switch (Number(codigo)) {
      case 1:
        cuisControl?.clearValidators();
        break;
      case 2:
        cuisControl?.setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(7)]);
        break;
      case 3:
        cuisControl?.setValidators([Validators.required, Validators.pattern(/^[0-9]{1,6}$/)]);
        break;
      default:
        break;
    }    
    cuisControl?.updateValueAndValidity();
  }

  changeCui(){
    const cui = this.pedidoForm.get('cuis')?.value
    if(cui.length >= 6 && cui.length  <= 7){
      this.obtenerAcuerdosService()
    }
  }

  obtenerAcuerdosService(){
    const cui = this.pedidoForm.get('cuis')?.value
    this.paginationAcuerdos.cui = cui
    this.loadingAcuerdos = true
    this.acuerdosService.listarAcuerdos(this.paginationAcuerdos)
      .subscribe( resp => {
        this.loadingAcuerdos = false
        this.acuerdos.set(resp.data)
        this.paginationAcuerdos.total = resp.info?.total
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    this.paginationAcuerdos.currentPage = params.pageIndex
    this.obtenerAcuerdosService()
  }

  disabledDate = (current: Date): boolean => {
    if (this.fechaEvento == null) return false;

    return differenceInCalendarDays(this.fechaEvento, current) > 0;
  }



  crearPedidoForm(): void {
    this.pedidoForm = this.fb.group({
      prioridadID: [this.pedidoSeleccionado?.prioridadID],
      espacioSelect: [this.pedidoSeleccionado?.espacioSelect, [Validators.required]],
      sectorSelect: [this.pedidoSeleccionado?.sectorSelect],
      tipoCodigoSelect: [this.pedidoSeleccionado?.tipoCodigoSelect, [Validators.required]],
      departamentoSelect: [this.pedidoSeleccionado?.departamentoSelect],
      provinciaSelect: [this.pedidoSeleccionado?.provinciaSelect],
      distritoSelect: [this.pedidoSeleccionado?.distritoSelect],
      ejeEstrategicoSelect: [this.pedidoSeleccionado?.ejeEstrategicoSelect, [Validators.required]],
      tipoIntervencionSelect: [this.pedidoSeleccionado?.tipoIntervencionSelect, [Validators.required]],
      aspectoCriticoResolver: [this.pedidoSeleccionado?.aspectoCriticoResolver, [Validators.required]],
      cuis: [this.pedidoSeleccionado?.cuis],
    });
  }

}
