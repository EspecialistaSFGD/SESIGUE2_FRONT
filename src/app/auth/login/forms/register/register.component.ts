import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ThemeSwitcherComponent } from '@libs/shared/components/theme-switcher/theme-switcher.component';
import { OnlyNumbersDirective } from '@libs/shared/directives/only-numbers.directive';
import { SectoresStore } from '@libs/shared/stores/sectores.store';
import { UbigeosStore } from '@libs/shared/stores/ubigeos.store';
import { AuthService } from '@libs/services/auth/auth.service';
import { EntidadesStore } from '@libs/shared/stores/entidades.store';
import { SelectModel } from '@libs/models/shared/select.model';



const dniValidPattern = /^\d{8}$/;
const claveValidPattern = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\~-]{6,}$/;
const telefonoValidPattern = /^\d{9}$/;

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
  styles: ``,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private timeout: any;

  dni: string = '';

  sectoresStore = inject(SectoresStore);
  ubigeosStore = inject(UbigeosStore);
  authService = inject(AuthService);
  entidadesStore = inject(EntidadesStore);
  // numericPipe = inject(NumericPipe);

  registerForm!: UntypedFormGroup;
  // depSeleccionado: SelectModel | null = null;
  // provSeleccionada: SelectModel | null = null;
  requiredLabel: string = 'Campo requerido';
  passwordVisible: boolean = false;

  constructor() {
    this.onCreateRegisterForm();
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
        this.authService.verificarDisponibilidadDni(value).subscribe({
          next: (v) => {
            if (!v?.success) {
              this.registerForm.get('dni')?.setErrors({ dniNoDisponible: true });
            } else {
              this.registerForm.get('dni')?.setErrors(null);
              this.executeCuiListing(value);
            }
          },
          error: (e) => {
            console.error(e);
          },
        });
      }
    }, 500);
  }

  private executeCuiListing(value: string) {
    this.dni = value;
  }

  onTelefonoChange(event: Event): void {

    const target = event.target as HTMLInputElement;
    let value = target.value;
    value = value.replace(/\D/g, '');

    const telefonoControl = this.registerForm.get('telefono');

    telefonoControl?.setValue(value, { emitEvent: false });
    telefonoControl?.updateValueAndValidity();
  }

  onTipoChange(event: SelectModel): void {
    const sectorControl = this.registerForm.get('sector');
    const depControl = this.registerForm.get('dep');
    const provControl = this.registerForm.get('prov');
    const perfilControl = this.registerForm.get('perfil');
    const entidadControl = this.registerForm.get('entidad');
    perfilControl?.reset();
    entidadControl?.reset();

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
    const entidadControl = this.registerForm.get('entidad');
    entidadControl?.reset();

    if (event === null) return;

    this.entidadesStore.listarEntidades(0, 1, Number(event.value));

  }

  onDepChange(value: SelectModel): void {
    const provControl = this.registerForm.get('prov');
    const entidadControl = this.registerForm.get('entidad');
    const perfilControl = this.registerForm.get('perfil');

    provControl?.reset();
    entidadControl?.reset();
    perfilControl?.reset();

    if (value == null) return;

    if (value.value) {
      this.ubigeosStore.listarProvincias(value.value.toString());
      this, this.entidadesStore.listarEntidades(0, 2, 0, Number(value.value));
    }

  }

  onProvChange(value: SelectModel): void {
    const entidadControl = this.registerForm.get('entidad');
    entidadControl?.reset();

    if (value == null) return;

    if (value && value.value) {
      this.ubigeosStore.listarDistritos(value.value?.toString());

      if (this.registerForm.get('dis')?.value != null) {
        this.registerForm.patchValue({ dis: null });
      }
    }

    this.entidadesStore.listarEntidades(0, 2, 0, Number(value.value));
  }

  onDisChange(value: SelectModel): void {
    const entidadControl = this.registerForm.get('entidad');
    entidadControl?.reset();

    if (value == null) return;

    //TODO: actualizar entidades por distritos
    this.entidadesStore.listarEntidades(0, 2, 0, Number(value.value));
  }

  onEntidadChange(event: SelectModel): void {
    const perfilControl = this.registerForm.get('perfil');
    perfilControl?.reset();

    if (event == null) return;

    this.entidadesStore.listarPerfiles(Number(event.value));
  }

  onPerfilChange(event: SelectModel): void { }

  onRegister(): void {
    this.registerForm.get('perfil')?.patchValue(`${18}`)    
    this.authService.registrarUsuario(this.registerForm.value).subscribe({
      next: (v) => {
        if (v?.success) {
          if (v.data != 0) {
            this.router.navigate(['/auth'], { queryParams: { action: 'login' } });
          }
        }
      },
      error: (e) => {
        console.error(e);
      },
      complete: () => this.registerForm.reset(),
    });
  }

  onCreateRegisterForm(): void {
    this.registerForm = this.fb.group({
      tipo: [null, [Validators.required]],
      dep: [null],
      prov: [null],
      dis: [null],
      entidad: [null, [Validators.required]],
      sector: [null],
      perfil: [null],
      nombre: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      dni: [null, [Validators.required, Validators.pattern(/^\d{8}$/)]],
      correo: [null, [Validators.required, Validators.email]],
      telefono: [null, [Validators.required, Validators.pattern(telefonoValidPattern)]],
      clave: [null, [Validators.required, Validators.pattern(claveValidPattern)]],
    });
  }


}
