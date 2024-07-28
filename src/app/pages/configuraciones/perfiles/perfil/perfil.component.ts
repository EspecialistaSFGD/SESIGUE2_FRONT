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
import { SectoresStore } from '../../../../libs/shared/stores/sectores.store';
import { UtilesService } from '../../../../libs/shared/services/utiles.service';
import { PerfilesService } from '../../../../libs/services/configuraciones/perfiles.service';
import { PerfilModel } from '../../../../libs/models/auth/perfil.model';
import { SelectModel } from '../../../../libs/models/shared/select.model';
import { EntidadesStore } from '../../../../libs/shared/stores/entidades.store';
import { UbigeosStore } from '../../../../libs/shared/stores/ubigeos.store';
import { PerfilesStore } from '../../../../libs/shared/stores/perfiles.store';

@Component({
  selector: 'app-perfil',
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
  templateUrl: './perfil.component.html',
  styles: ``
})
export class PerfilComponent {
  perfilForm!: UntypedFormGroup;
  fechaDateFormat = 'dd/MM/yyyy';
  requiredLabel: string = 'Campo requerido';
  private fb = inject(UntypedFormBuilder);
  public sectoresStore = inject(SectoresStore);
  public entidadesStore = inject(EntidadesStore);
  public ubigeosStore = inject(UbigeosStore);
  private utilesService = inject(UtilesService);
  perfilesService = inject(PerfilesService);
  perfilesStore = inject(PerfilesStore);
  perfilSeleccionado: PerfilModel = this.perfilesService.perfilSeleccionado();

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  constructor() {
    this.crearPerfilForm();

    if (this.perfilSeleccionado?.nivelSelect != null) {
      this.onNivelChange(this.perfilSeleccionado.nivelSelect);
    }
  }

  onNivelChange(event: SelectModel): void {
    const perfilControl = this.perfilForm.get('perfil');
    const entidadControl = this.perfilForm.get('entidad');
    perfilControl?.reset();
    entidadControl?.reset();

    if (event === null) return;

    this.perfilesStore.listarSubTipos(true, Number(event.value));
  }

  onSectorChange(event: SelectModel): void {
    const entidadControl = this.perfilForm.get('entidad');
    entidadControl?.reset();

    if (event === null) return;

    this.entidadesStore.listarEntidades(0, 1, Number(event.value));

  }

  onDepChange(value: SelectModel): void {
    const provControl = this.perfilForm.get('prov');
    const entidadControl = this.perfilForm.get('entidad');
    const perfilControl = this.perfilForm.get('perfil');

    provControl?.reset();
    entidadControl?.reset();
    perfilControl?.reset();

    if (value == null) return;

    this.ubigeosStore.listarProvincias(Number(value.value));
    this, this.entidadesStore.listarEntidades(0, 2, 0, Number(value.value));
  }

  onProvChange(value: SelectModel): void {
    const entidadControl = this.perfilForm.get('entidad');
    entidadControl?.reset();

    if (value == null) return;

    this.entidadesStore.listarEntidades(0, 2, 0, Number(value.value));
  }

  onEntidadChange(event: SelectModel): void {
    const perfilControl = this.perfilForm.get('perfil');
    perfilControl?.reset();

    if (event == null) return;

    this.entidadesStore.listarPerfiles(Number(event.value));
  }

  crearPerfilForm(): void {
    this.perfilForm = this.fb.group({
      codigoPerfil: [this.perfilSeleccionado?.codigoPerfil],
      descripcionPerfil: [this.perfilSeleccionado?.descripcionPerfil, [Validators.required]],
      // descripcionExtensa: [this.perfilSeleccionado?.descripcionExtensa],
      estado: [this.perfilSeleccionado?.esActivo],
      nivelSelect: [this.perfilSeleccionado?.nivelSelect],
      subTipoSelect: [this.perfilSeleccionado?.subTipoSelect],
      // tipo: [null],
      // sector: [null],
      // dep: [null],
      // prov: [null],
    });
  }

}
