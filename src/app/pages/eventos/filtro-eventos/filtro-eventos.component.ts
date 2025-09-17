import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Pagination } from '@core/interfaces';
import { ValidatorService } from '@core/services/validators';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';

@Component({
  selector: 'app-filtro-eventos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgZorroModule],
  templateUrl: './filtro-eventos.component.html',
  styles: ``
})
export class FiltroEventosComponent {
  @Input() visible: boolean = false
  @Input() pagination: any = {}

  @Output() filters = new EventEmitter<Pagination>();
  @Output() visibleDrawer = new EventEmitter()
  @Output() save = new EventEmitter<boolean>()
  @Output() export = new EventEmitter<boolean>()

  private timeout: any;

  private fb = inject(FormBuilder)
  private validatorsService = inject(ValidatorService)

  formEventoFilters:FormGroup = this.fb.group({
    nombre: [ null ],
    estado: [ null ],
    tipoEntidad: [ null ],
  })

  changeVisibleDrawer(visible: boolean, save: boolean = true){
    this.save.emit(save) 
    this.visibleDrawer.emit(visible)
  }

  changeControl(event: any, control:string){
    const codigoControl = this.formEventoFilters.get(control)
    const codigoValue = codigoControl?.value

    const nameControl = control as keyof Pagination;
    if(codigoValue){
      clearTimeout(this.timeout);
      var $this = this;
      this.timeout = setTimeout(function () {
        if ($this.validatorsService.codigoPattern.test(event.key) || event.key === 'Backspace' || event.key === 'Delete' || codigoValue.length > 0) {          
          $this.pagination[nameControl] = codigoValue          
          $this.generateFilters()
        }
      }, 500);      
    } else {
      codigoControl?.patchValue(null)
      delete this.pagination[nameControl]      
      this.generateFilters()
    }
  }

  cleanParams(){
    localStorage.removeItem('filtrosEventos');
    this.formEventoFilters.reset()
    this.generateFilters()
    this.changeVisibleDrawer(false,false)
  }

  generateFilters(){ 
    const formValue = { ...this.formEventoFilters.value }
    this.filters.emit(formValue)
  }
}
