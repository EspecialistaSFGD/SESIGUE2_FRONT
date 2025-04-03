import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';

@Component({
  selector: 'app-filtros-usuario',
  standalone: true,
  imports: [CommonModule, NgZorroModule, ReactiveFormsModule],
  templateUrl: './filtros-usuario.component.html',
  styles: ``
})
export class FiltrosUsuarioComponent {

  @Input() visible: boolean = false

  fb = inject(FormBuilder)

  formFilters: FormGroup = this.fb.group({
      dni: [''],
      perfil: [''],
      sectorId: [''],
      departameno: [''],
      provincia: [''],
      distrito: [''],
      ubigeo: ['']
    })

    changeExport(){
      this.visible = false
    }
}
