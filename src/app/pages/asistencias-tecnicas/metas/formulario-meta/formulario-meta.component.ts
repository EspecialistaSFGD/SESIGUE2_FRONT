import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { MetaNew, UsuarioResponse } from '@core/interfaces';
import { ValidatorService } from '@core/services/validators';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-formulario-meta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgZorroModule],
  templateUrl: './formulario-meta.component.html',
  styles: ``
})
export class FormularioMetaComponent {

  readonly dataMetaNew: MetaNew = inject(NZ_MODAL_DATA);

  private fb = inject(FormBuilder)
  private validatorService = inject(ValidatorService)
  
  formMeta: FormGroup = this.fb.group({
    fecha: ['', Validators.required],
    usuarios: this.fb.array([]),
  })

  get usuarios(): FormArray {
    return this.formMeta.get('usuarios') as FormArray;
  }

  ngOnInit(): void {
    this.agregarUsuariosFormArray()
  }

  agregarUsuariosFormArray(){    
    const usuarios:UsuarioResponse[]  = this.dataMetaNew.usuarios
    for(let usuario of usuarios){
      const usuariosRow = this.fb.group({
        usuarioId: [usuario.codigoUsuario, Validators.required],
        nombre: [usuario.nombresPersona],
        meta: [ '32', [Validators.required, Validators.pattern(this.validatorService.NumberPattern)]],
      })
      this.usuarios.push(usuariosRow)
    }
  }

  alertMessageError(control: string) {
    return this.formMeta.get(control)?.errors && this.formMeta.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formMeta.get(control)?.errors;

    return typeErrorControl(text, errors)
  }

  alertMessageErrorTwoNivel(index: number, subcontrol: string) {
    const getControl = this.formMeta.get('usuarios') as FormArray
    const levelControl = getControl.at(index).get(subcontrol)
    return levelControl?.errors && levelControl?.touched
  }

   msgErrorControlTwoNivel(index: number, subcontrol: string, label?: string): string {
      const getControl = this.formMeta.get('usuarios') as FormArray
      const levelControl = getControl.at(index).get(subcontrol)
      const text = label ? label : subcontrol
      const errors = levelControl?.errors;
  
      return typeErrorControl(text, errors)
    }
}
