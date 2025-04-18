import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { HitoAcuerdoModel } from '../../../libs/models/pedido';
import { HitosService } from '../../../libs/services/pedidos/hitos.service';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { UtilesService } from '../../../libs/shared/services/utiles.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { AcuerdosService } from '../../../libs/services/pedidos/acuerdos.service';
import { SectoresStore } from '../../../libs/shared/stores/sectores.store';
import { SelectModel } from '../../../libs/models/shared/select.model';
import { isSameDay, isBefore, isAfter, parseISO } from 'date-fns';

@Component({
  selector: 'app-hito',
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
  ],
  templateUrl: './hito.component.html',
  styles: ``,
  providers: []
})
export class HitoComponent {
  hitoForm!: UntypedFormGroup;
  fechaDateFormat = 'dd/MM/yyyy';

  private fb = inject(UntypedFormBuilder);
  public hitosService = inject(HitosService);
  public acuerdosService = inject(AcuerdosService);
  public sectoresStore = inject(SectoresStore);
  private utilesService = inject(UtilesService);

  private hitoSeleccionado = this.hitosService.hitoSeleccionado();
  private acuerdoSeleccionado = this.acuerdosService.acuerdoSeleccionado();
  private seleccion: SelectModel | null = null;

  public plazo = (this.acuerdoSeleccionado?.plazo != null) ? this.utilesService.stringToDate(this.acuerdoSeleccionado?.plazo.toString() || null) : null;
  public fechaEvento = (this.acuerdoSeleccionado?.fechaEvento != null) ? parseISO(this.acuerdoSeleccionado?.fechaEvento.toString()) : null;

  constructor() {

    this.crearHitoForm();

    if (this.hitoSeleccionado?.responsableSelect == null) {
      if (this.acuerdoSeleccionado?.responsableSelect != null) {
        this.seleccion = this.acuerdoSeleccionado?.responsableSelect;
      } else {
        this.seleccion = null;
      }
    } else {
      this.seleccion = this.hitoSeleccionado.responsableSelect
    }

    this.onResponsableIDChange(this.seleccion);

    console.log('fechaEvento', this.fechaEvento);
    console.log('plazo', this.plazo);

  }

  onResponsableIDChange(tipo: SelectModel | null): void {
    const acuerdoId = this.acuerdoSeleccionado?.acuerdoId;
    if (tipo == null || acuerdoId == null) return;
    this.sectoresStore.listarEntidadesResponsables(Number(tipo.value), acuerdoId);
  }

  onEntidadIDChange(id: number): void {
    console.log(id);
  }

  disabledDate = (current: Date): boolean => {
    // Si 'plazo' o 'fechaEvento' son null, permitir todas las fechas
    if (!this.plazo || !this.fechaEvento) {
      return false;
    }

    // Habilitar solo las fechas entre 'fechaEvento' y 'plazo', incluyendo ambas
    return (
      isBefore(current, this.fechaEvento) ||
      isAfter(current, this.plazo) &&
      !isSameDay(current, this.fechaEvento) &&
      !isSameDay(current, this.plazo)
    );
  }

  onPlazoChange(fecha: Date) {
    console.log(fecha);
  }

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  crearHitoForm(): void {

    this.hitoForm = this.fb.group({
      hito: [this.hitoSeleccionado?.hito, [Validators.required]],
      plazo: [this.hitoSeleccionado?.plazoFecha, [Validators.required]],
      hitoId: [this.hitoSeleccionado?.hitoId],
      acuerdoId: [this.acuerdosService.acuerdoSeleccionado()?.acuerdoId, [Validators.required]],
      responsableSelect: [this.acuerdoSeleccionado?.responsableSelect, [Validators.required]],
      entidadSelect: [this.hitoSeleccionado?.entidadSelect, [Validators.required]],
      //entidadId: [null],
    });
  }

}
