import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { InversionTareaResponse, Pagination } from '@core/interfaces';
import { InversionTareaService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormularioInversionTareaComponent } from './formulario-inversion-tarea/formulario-inversion-tarea.component';

@Component({
  selector: 'app-inversion-tareas',
  standalone: true,
  imports: [CommonModule, NgZorroModule, PageHeaderComponent],
  templateUrl: './inversion-tareas.component.html',
  styles: ``
})
export default class InversionTareasComponent {
  title: string = `Tareas`;
  @Input() inversionId!:string

  loadingTareas: boolean =  false
  
  paginationTareas: Pagination = {
    columnSort: 'fechaRegistro',
    typeSort: 'ASC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  inversionTarea: InversionTareaResponse = {
    plazo: '',
    entidadId: '',
    inversionHitoId: '',
    inversionId: '',
    responsableId: ''
  }
  
  inversionTareas = signal<InversionTareaResponse[]>([])

  private inversionTareasServices = inject(InversionTareaService)
    private modal = inject(NzModalService);

  ngOnInit(): void {
    this.obtenerInversionTareasService()
  }

  obtenerInversionTareasService(){
    this.loadingTareas = true
    this.inversionTareasServices.ListarInversionFase({...this.paginationTareas, inversionId: this.inversionId})
      .subscribe( resp => {
        this.loadingTareas = false
        this.inversionTareas.set(resp.data)
        this.paginationTareas.total = resp.info?.total
      })
  }

  agregarTarea(){
    this.inversionTarea.inversionId = this.inversionId
    this.inversionTareaFormModal(true)
  }

  actualizarTarea(inversionTarea: InversionTareaResponse){
    this.inversionTarea = inversionTarea
    this.inversionTareaFormModal(false)
  }

  inversionTareaFormModal(create: boolean){
    const action = `${create ? 'Crear' : 'Actualizar' } tarea`
    const modal = this.modal.create<FormularioInversionTareaComponent>({
      nzTitle: `${action.toUpperCase()}`,
      // nzWidth: '50%',
      nzContent: FormularioInversionTareaComponent,
      nzData: {
        create,
        inversionTarea: this.inversionTarea
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

          }
        }
      ]
    })
  }

}
