import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MetaNew, UsuarioResponse } from '@core/interfaces';
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
        usuario: [usuario.codigoUsuario, Validators.required],
        nombre: [usuario.nombresPersona],
        meta: [ '32', Validators.required],
      })
      this.usuarios.push(usuariosRow)
    }
  }
}
