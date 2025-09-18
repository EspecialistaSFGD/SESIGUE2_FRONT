import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventoEstadoEnum } from '@core/enums';
import { convertEnumToObject, typeErrorControl } from '@core/helpers';
import { DataModalEvento, EventoResponse, ItemEnum, Pagination, TipoEventoResponse } from '@core/interfaces';
import { TipoEventosService } from '@core/services';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-formulario-evento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNgModule],
  templateUrl: './formulario-evento.component.html',
  styles: ``
})
export class FormularioEventoComponent {

  readonly dataEvento: DataModalEvento = inject(NZ_MODAL_DATA);
  
  create: boolean = this.dataEvento.create
  evento = signal<EventoResponse>(this.dataEvento.evento)
  estados: ItemEnum[] = convertEnumToObject(EventoEstadoEnum)
  tipoEventos = signal<TipoEventoResponse[]>([])
  
  private fb = inject(FormBuilder)
  private tipoEventosServices = inject(TipoEventosService)

  formEvento:FormGroup = this.fb.group({
    nombre: [null, Validators.required],
    abreviatura: [null, Validators.required],
    fechaEvento: [ null, Validators.required ],
    fechaFinEvento: [ null, Validators.required ],
    vigente: [ null, Validators.required ],
    subTipoId: [ null, Validators.required ],
    codigoTipoEvento: [ null, Validators.required ],
    verificaAsistentes: [ null, Validators.required ],
  })

  ngOnInit(): void {
    this.obtenerServicioTipoEspacio()
  }

  alertMessageError(control: string) {
    return this.formEvento.get(control)?.errors && this.formEvento.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formEvento.get(control)?.errors;

    return typeErrorControl(text, errors)
  }

  obtenerServicioTipoEspacio() {
    const pagination: Pagination = { code: 0, columnSort: 'codigoTipoEvento', typeSort: 'DESC', pageSize: 10, currentPage: 1, total: 0}
    this.tipoEventosServices.getAllTipoEvento(pagination).subscribe(resp => this.tipoEventos.set(resp.data))
  }

  validateDate(control: string){
    const fechaEventoControl = this.formEvento.get('fechaEvento')
    const fechaCreacionValue = fechaEventoControl?.value
    const fechaFinEventoControl = this.formEvento.get('fechaFinEvento')
    const fechaVigenciaValue = fechaFinEventoControl?.value

    const fechaCreacion = new Date(fechaCreacionValue);
    const fechaVigencia = new Date(fechaVigenciaValue);

    if(control == 'fechaEvento'){
      if (fechaCreacionValue && fechaVigenciaValue && fechaCreacion >= fechaVigencia) {
        fechaEventoControl?.setErrors({ ...fechaEventoControl.errors, msgBack: 'La fecha de creación debe ser menor que la fecha de vigencia.' });
      } else {
        fechaFinEventoControl?.setErrors(null)
      }
    } else if(control == 'fechaFinEvento'){
      if (fechaCreacionValue && fechaVigenciaValue && fechaVigencia <= fechaCreacion) {
        fechaFinEventoControl?.setErrors({ ...fechaFinEventoControl.errors, msgBack: 'La fecha de vigencia debe ser mayor que la fecha de creación.' });
      } else {
        fechaEventoControl?.setErrors(null)
      }
    }
  }

  changeAsistente(){
    const asistenteControl = this.formEvento.get('verificaAsistentes')
    const asistente = asistenteControl?.value
    console.log(asistente);
    
  }
}
