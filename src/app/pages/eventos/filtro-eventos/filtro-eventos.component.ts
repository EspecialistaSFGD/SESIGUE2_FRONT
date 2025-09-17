import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EventoEstadoEnum } from '@core/enums';
import { convertEnumToObject } from '@core/helpers';
import { ItemEnum, Pagination, TipoEventoResponse } from '@core/interfaces';
import { TipoEventosService } from '@core/services';
import { ValidatorService } from '@core/services/validators';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';

@Component({
  selector: 'app-filtro-eventos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgZorroModule, PrimeNgModule],
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
  estados: ItemEnum[] = convertEnumToObject(EventoEstadoEnum)

  tipoEventos = signal<TipoEventoResponse[]>([])

  private fb = inject(FormBuilder)
  private validatorsService = inject(ValidatorService)
  private tipoEventosServices = inject(TipoEventosService)

  formEventoFilters:FormGroup = this.fb.group({
    nombre: [ null ],
    estado: [ null ],
    tipoEspacioId: [ null ],
  })

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.estados);
    
    this.obtenerServicioTipoEspacio()
  }

  obtenerServicioTipoEspacio() {
    const pagination: Pagination = { code: 0, columnSort: 'codigoTipoEvento', typeSort: 'DESC', pageSize: 10, currentPage: 1, total: 0}
    this.tipoEventosServices.getAllTipoEvento(pagination).subscribe(resp => this.tipoEventos.set(resp.data))
  }

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

  changeSelect(){
    this.generateFilters()
  }
}
