import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';

@Component({
  selector: 'app-filtros-atencion',
  standalone: true,
  imports: [CommonModule, NgZorroModule, ReactiveFormsModule],
  templateUrl: './filtros-atencion.component.html',
  styles: ``
})
export class FiltrosAtencionComponent {
  @Input() visible: boolean = false
  @Output() visibleDrawer = new EventEmitter()

  private fb = inject(FormBuilder)

  formFilters: FormGroup = this.fb.group({
    tipoEntidad: [ '' ],
    tipoAtencion: [ '' ],
    departameno: [''],
    provincia: [''],
    distrito: [''],
    ubigeo: [''],
    sector: [''],
    unidadOrganica: [''],
    especialista: [''],
  })

  changeVisibleDrawer(visible: boolean){
    this.visibleDrawer.emit(visible)
  }
}
