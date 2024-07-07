import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { HitosService } from '../../../libs/services/pedidos/hitos.service';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { AcuerdosService } from '../../../libs/services/pedidos/acuerdos.service';
import { AvancesService } from '../../../libs/services/pedidos/avances.service';
import { SectoresStore } from '../../../libs/stores/shared/sectores.store';
import { SelectModel } from '../../../libs/models/shared/select.model';

@Component({
  selector: 'app-avance',
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
  templateUrl: './avance.component.html',
  styleUrl: './avance.component.less',
  providers: []
})
export class AvanceComponent {
  avanceForm!: UntypedFormGroup;
  fechaDateFormat = 'dd/MM/yyyy';

  private fb = inject(UntypedFormBuilder);
  public hitosService = inject(HitosService);
  public acuerdosService = inject(AcuerdosService);
  public avancesService = inject(AvancesService);
  public sectoresStore = inject(SectoresStore);
  private hitoSeleccionado = this.hitosService.hitoSeleccionado();
  private acuerdoSeleccionado = this.acuerdosService.acuerdoSeleccionado();

  constructor() {
    this.crearAvanceForm();

    if (this.hitoSeleccionado?.responsableSelect != null) {
      this.onResponsableIDChange(this.hitoSeleccionado.responsableSelect);
    }

  }

  // onResponsableIDChange(id: number): void {
  //   if (id == null) return;
  //   console.log(id);
  // }

  onEntidadIDChange(id: number): void {
    if (id == null) return;
    console.log(id);
  }

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  onResponsableIDChange(tipo: SelectModel): void {
    const acuerdoId = this.acuerdoSeleccionado?.acuerdoId;
    if (tipo == null || acuerdoId == null) return;
    this.sectoresStore.listarEntidadesResponsables(Number(tipo.value), acuerdoId);
  }

  crearAvanceForm(): void {
    const avanceSeleccionado = this.avancesService.avanceSeleccionado();

    this.avanceForm = this.fb.group({
      avanceId: [avanceSeleccionado?.avanceId],
      hitdoId: [this.hitoSeleccionado?.hitoId, [Validators.required]],
      fecha: [avanceSeleccionado?.fechaDate, [Validators.required]],
      avance: [avanceSeleccionado?.avance, [Validators.required]],
      evidencia: [avanceSeleccionado?.evidencia, [Validators.required]],
      entidadSelect: [avanceSeleccionado?.entidadSelect, [Validators.required]],
      responsableSelect: [this.hitoSeleccionado?.responsableSelect, [Validators.required]],
    });
  }
}
