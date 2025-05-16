import { CommonModule } from '@angular/common';
import { Component, inject, Input, Signal, signal } from '@angular/core';
import { IntervencionEspacioResponse, IntervencionTareaResponse, Pagination } from '@core/interfaces';
import { IntervencionTareaService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormularioIntervencionTareaComponent } from './formulario-Intervencion-tarea/formulario-intervencion-tarea.component';
import { getDateFormat } from '@core/helpers';

@Component({
  selector: 'app-intervencion-tareas',
  standalone: true,
  imports: [CommonModule, NgZorroModule ],
  templateUrl: './intervencion-tareas.component.html',
  styles: ``
})
export default class IntervencionTareasComponent {

  title: string = `Tareas`;
  @Input() intervencionEspacio!: IntervencionEspacioResponse

  loadingTareas: boolean =  false
  
  paginationTareas: Pagination = {
    columnSort: 'fechaRegistro',
    typeSort: 'ASC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  intervencionTarea: IntervencionTareaResponse = {
    tarea: '',
    plazo: '',
    entidadId: '',
    intervencionHitoId: '',
    intervencionEspacioId: '',
    responsableId: ''
  }
  
  intervencionTareas = signal<IntervencionTareaResponse[]>([])

  private intervencionTareasServices = inject(IntervencionTareaService)
  private modal = inject(NzModalService);

  ngOnInit(): void {    
    this.obtenerIntervencionTareasService()
  }

  obtenerIntervencionTareasService(){
    this.loadingTareas = true
    const intervencionEspacioId = this.intervencionEspacio.intervencionEspacioId

    this.intervencionTareasServices.ListarIntervencionTareas({...this.paginationTareas, intervencionEspacioId})
      .subscribe( resp => {
        this.loadingTareas = false
        this.intervencionTareas.set(resp.data)
        this.paginationTareas.total = resp.info?.total
      })
  }

  agregarTarea(){
    this.intervencionTarea.intervencionEspacioId = this.intervencionEspacio.intervencionId
    this.intervencionTareaFormModal(true)
  }

  actualizarTarea(intervencionTarea: IntervencionTareaResponse){
    this.intervencionTarea = intervencionTarea
    this.intervencionTareaFormModal(false)
  }

  intervencionTareaFormModal(create: boolean){
    const action = `${create ? 'Crear' : 'Actualizar' } tarea`
    this.modal.create<FormularioIntervencionTareaComponent>({
      nzTitle: `${action.toUpperCase()}`,
      nzWidth: '50%',
      nzContent: FormularioIntervencionTareaComponent,
      nzData: {
        intervencionEspacio: this.intervencionEspacio,
        create,
        intervencionTarea: this.intervencionTarea
      },
      nzFooter: [
        {
          label: 'Cancelar',
          type: 'default',
          onClick: () => this.modal.closeAll(),
        },
        {
          label: action,
          type: 'primary',
          onClick: (componentResponse) => {
            const formIntervencionTarea = componentResponse!.formIntervencionTarea
            if (formIntervencionTarea.invalid) {
              const invalidFields = Object.keys(formIntervencionTarea.controls).filter(field => formIntervencionTarea.controls[field].invalid);
              console.error('Invalid fields:', invalidFields);
              return formIntervencionTarea.markAllAsTouched();
            }

            const datePlazo =  new Date(formIntervencionTarea.get('plazo')?.value)

            const plazoDateFormat =  getDateFormat(datePlazo,'month')
            formIntervencionTarea.get('plazo')?.setValue(plazoDateFormat)
            const accesoId = localStorage.getItem('codigoUsuario')!

            let intervencionTarea: IntervencionTareaResponse = { ...formIntervencionTarea.getRawValue() }

            if(create){ 
              intervencionTarea.accesoId = accesoId
              this.crearIntervencionTarea(intervencionTarea)         
            }
          }
        }
      ]
    })
  }

  crearIntervencionTarea(intervencionTarea: IntervencionTareaResponse){    
    const intervencionEspacioId = this.intervencionEspacio.intervencionEspacioId! 
    this.intervencionTareasServices.registarIntervencionTarea({...intervencionTarea, intervencionEspacioId})
      .subscribe( resp => {
        this.obtenerIntervencionTareasService()
        this.modal.closeAll()
      })
  }

}
