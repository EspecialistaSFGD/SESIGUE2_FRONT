import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { SelectModel } from '../../libs/models/shared/select.model';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { AuthService } from '../../libs/services/auth/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SectoresStore } from '../../libs/shared/stores/sectores.store';
import { UbigeosStore } from '../../libs/shared/stores/ubigeos.store';
import { ThemeSwitcherComponent } from '../../libs/shared/components/theme-switcher/theme-switcher.component';
import { NumericPipe } from '../../libs/shared/pipes/numeric.pipe';
import { OnlyNumbersDirective } from '../../libs/shared/directives/only-numbers.directive';

const dniValidPattern = /^\d{8}$/;
const claveValidPattern = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\~-]{6,}$/;
const telefonoValidPattern = /^\d+$/;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NzLayoutModule,
    NzFormModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzCheckboxModule,
    NzIconModule,
    ThemeSwitcherComponent,
    OnlyNumbersDirective,
  ],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private timeout: any;

  dni: string = '';

  sectoresStore = inject(SectoresStore);
  ubigeosStore = inject(UbigeosStore);
  authService = inject(AuthService);
  // numericPipe = inject(NumericPipe);

  registerForm!: UntypedFormGroup;
  // depSeleccionado: SelectModel | null = null;
  // provSeleccionada: SelectModel | null = null;
  requiredLabel: string = 'Campo requerido';
  passwordVisible: boolean = false;
  isLoading: boolean = false;

  constructor() {
    this.onRegisterForm();
  }

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  onDniChange(event: Event) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      const target = event.target as HTMLInputElement;
      let value = target.value;

      // Filtrar caracteres no numéricos
      // value = value.replace(/\D/g, '');

      // // Actualizar el valor del control del formulario y marcarlo como "touched" para que la validación se dispare correctamente
      // const dniControl = this.registerForm.get('dni');
      // dniControl?.setValue(value, { emitEvent: false });
      // dniControl?.updateValueAndValidity();

      // Validar si el valor es numérico
      if (!dniValidPattern.test(value)) {
        return;
      }

      if (value) {
        this.executeCuiListing(value);
      }
    }, 500);
  }

  private executeCuiListing(value: string) {
    this.dni = value;
    console.log(this.dni);

  }

  onTelefonoChange(event: Event): void {

    const target = event.target as HTMLInputElement;
    let value = target.value;
    value = value.replace(/\D/g, '');

    const telefonoControl = this.registerForm.get('telefono');

    telefonoControl?.setValue(value, { emitEvent: false });
    telefonoControl?.updateValueAndValidity();


    console.log(telefonoControl?.value);

  }

  onResponsableChange(event: SelectModel): void {
    const sectorControl = this.registerForm.get('sector');
    const depControl = this.registerForm.get('dep');
    const provControl = this.registerForm.get('prov');

    if (event === null) return;

    if (event.label === 'GN') {
      sectorControl?.setValidators([Validators.required]);
      depControl?.reset();
      depControl?.clearValidators();
      provControl?.reset();
      provControl?.clearValidators();
    } else {
      depControl?.setValidators([Validators.required]);
      sectorControl?.reset();
      sectorControl?.clearValidators();
    }

    depControl?.updateValueAndValidity();
    sectorControl?.updateValueAndValidity();
  }

  onSectorChange(event: SelectModel): void {
    if (event === null) return;
    const entidadControl = this.registerForm.get('entidad');
    entidadControl?.reset();
  }

  onDepChange(value: SelectModel): void {
    const provControl = this.registerForm.get('prov');

    provControl?.reset();

    // this.depSeleccionado = value;

    if (value != null) {
      this.ubigeosStore.listarProvincias(Number(value.value));

      // if (this.provSeleccionada != null) {
      //   this.provSeleccionada = null;
      // }
    }
  }

  onProvChange(value: SelectModel): void {
    if (value == null) return;

    const entidadControl = this.registerForm.get('entidad');
    entidadControl?.reset();
  }

  onEntidadChange(event: SelectModel): void { }

  onRegister(): void { }

  onRegisterForm(): void {
    this.registerForm = this.fb.group({
      responsable: [null, [Validators.required]],
      dep: [null],
      prov: [null],
      entidad: [null],
      sector: [null],
      nombre: [null, [Validators.required]],
      dni: [null, [Validators.required, Validators.pattern(/^\d{8}$/)]],
      correo: [null, [Validators.required, Validators.email]],
      telefono: [null, [Validators.required, Validators.pattern(telefonoValidPattern)]],
      clave: [null, [Validators.required, Validators.pattern(claveValidPattern)]],
    });
  }


}
