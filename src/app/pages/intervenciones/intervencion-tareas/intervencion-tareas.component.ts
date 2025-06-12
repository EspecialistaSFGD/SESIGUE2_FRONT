import { CommonModule } from '@angular/common';
import { Component, inject, Input, Signal, signal } from '@angular/core';
import { IntervencionEspacioResponse, IntervencionTareaResponse, Pagination } from '@core/interfaces';
import { IntervencionTareaService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormularioIntervencionTareaComponent } from './formulario-Intervencion-tarea/formulario-intervencion-tarea.component';
import { getDateFormat } from '@core/helpers';
import IntervencionTareaAvancesComponent from './intervencion-tarea-avances/intervencion-tarea-avances.component';

@Component({
  selector: 'app-intervencion-tareas',
  standalone: true,
  imports: [CommonModule, NgZorroModule, IntervencionTareaAvancesComponent ],
  templateUrl: './intervencion-tareas.component.html',
  styles: ``
})
export default class IntervencionTareasComponent {

  title: string = `Tareas`;
  @Input() intervencionEspacio!: IntervencionEspacioResponse

  botonNuevoActivo: boolean = true
  listarAvances: boolean = false
  loadingTareas: boolean =  false
  
  pagination: Pagination = {
    columnSort: 'intervencionTareaId',
    typeSort: 'DESC',
    pageSize: 5,
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

    this.intervencionTareasServices.ListarIntervencionTareas({...this.pagination, intervencionEspacioId})
      .subscribe( resp => {
        this.loadingTareas = false
        this.intervencionTareas.set(resp.data)
        this.pagination.total = resp.info?.total

        resp.data.map( item => {
          if(item.estadoRegistroNombre != 'culminado'){
            this.botonNuevoActivo = false
            return
          }
        })
      })
  }

  obtenerIntervencionTareaService(tareaId: string){
    this.intervencionTareasServices.obtenerIntervencionTareas(tareaId).subscribe( resp => this.intervencionTarea = resp.data)
  }

  agregarTarea(){
    this.intervencionTarea = {
      tarea: '',
      plazo: '',
      entidadId: '',
      intervencionHitoId: '',
      intervencionEspacioId: this.intervencionEspacio.intervencionId,
      responsableId: ''
    } 
    this.intervencionTareaFormModal(true)
  }

  actualizarTarea(tareaId: string){
    this.obtenerIntervencionTareaService(tareaId)
    setTimeout(() => {
      this.intervencionTareaFormModal(false)
    }, 100);
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

            let intervencionTarea: IntervencionTareaResponse = { ...formIntervencionTarea.getRawValue(), accesoId }

            if(create){ 
              this.crearIntervencionTareaService(intervencionTarea)         
            } else {
              intervencionTarea.intervencionTareaId = this.intervencionTarea.intervencionTareaId
              this.actualizarTareaServices(intervencionTarea)
            }
          }
        }
      ]
    })
  }

  crearIntervencionTareaService(intervencionTarea: IntervencionTareaResponse){    
    const intervencionEspacioId = this.intervencionEspacio.intervencionEspacioId! 
    this.intervencionTareasServices.registarIntervencionTarea({...intervencionTarea, intervencionEspacioId})
      .subscribe( resp => {
        this.obtenerIntervencionTareasService()
        this.modal.closeAll()
      })
  }

  actualizarTareaServices(intervencionTarea: IntervencionTareaResponse){
    this.intervencionTareasServices.actualizarIntervencionTarea(intervencionTarea)
      .subscribe( resp => {
        this.obtenerIntervencionTareasService()
        this.modal.closeAll()
      })
  }

  eliminarTarea(tareaId: string){

  }

  obtenerTareaAvances(intervencionTarea: IntervencionTareaResponse){
    this.listarAvances = true
    this.intervencionTarea = intervencionTarea
  }

}
