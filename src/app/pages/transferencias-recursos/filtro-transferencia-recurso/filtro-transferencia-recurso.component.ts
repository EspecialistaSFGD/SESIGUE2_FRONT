import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Pagination } from '@core/interfaces';
import { ValidatorService } from '@core/services/validators';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';

@Component({
  selector: 'app-filtro-transferencia-recurso',
  standalone: true,
  imports: [CommonModule, NgZorroModule, ReactiveFormsModule],
  templateUrl: './filtro-transferencia-recurso.component.html',
  styles: ``
})
export class FiltroTransferenciaRecursoComponent {
  @Input() visible: boolean = false
  @Input() pagination: any = {}

  @Output() filters = new EventEmitter<Pagination>();
  @Output() visibleDrawer = new EventEmitter()
  @Output() save = new EventEmitter<boolean>()
  @Output() export = new EventEmitter<boolean>()

  private timeout: any;

  private fb = inject(FormBuilder);
  private validatorsService = inject(ValidatorService);

  formFilters:FormGroup = this.fb.group({
    codigo: [ null ],
    nombre: [ null ]
  })

   changeControl(event: any, control:string){
    const codigoControl = this.formFilters.get(control)
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

  changeVisibleDrawer(visible: boolean, save: boolean = true){
    this.save.emit(save) 
    this.visibleDrawer.emit(visible)
  }

  generateFilters(){    
    this.pagination = { ...this.formFilters.value } 
    this.filters.emit(this.pagination)
  }

  cleanParamsMesas(){
    localStorage.removeItem('filtrosTransferenciasRecursos');
    this.formFilters.reset()
    this.generateFilters()
    this.changeVisibleDrawer(false,false)
  }
}
