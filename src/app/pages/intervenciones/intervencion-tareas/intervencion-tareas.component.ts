import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { IntervencionTareaEstadoRegistroEnum } from '@core/enums';
import { convertDateStringToDate, convertEnumToObject, getDateFormat } from '@core/helpers';
import { IntervencionEspacioResponse, IntervencionTareaResponse, ItemEnum, Pagination } from '@core/interfaces';
import { PipesModule } from '@core/pipes/pipes.module';
import { IntervencionTareaService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { AuthService } from '@libs/services/auth/auth.service';
import { FormularioComentarComponent } from '@shared/formulario-comentar/formulario-comentar.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormularioIntervencionTareaComponent } from './formulario-Intervencion-tarea/formulario-intervencion-tarea.component';
import IntervencionTareaAvancesComponent from './intervencion-tarea-avances/intervencion-tarea-avances.component';
import { IconoValidadoComponent } from '@shared/icons/icono-validado/icono-validado.component';

@Component({
  selector: 'app-intervencion-tareas',
  standalone: true,
  imports: [CommonModule, NgZorroModule, IntervencionTareaAvancesComponent, PipesModule, IconoValidadoComponent ],
  templateUrl: './intervencion-tareas.component.html',
  styles: ``
})
export default class IntervencionTareasComponent {

  title: string = `Tareas`;
  @Input() intervencionEspacio!: IntervencionEspacioResponse

  botonNuevoActivo: boolean = true
  listarAvances: boolean = false
  loadingTareas: boolean =  false
  tareaId: number = 0

  permisosPCM: boolean = false
  perfilAuth: number = 0

  estadosRegistros: ItemEnum[] = convertEnumToObject(IntervencionTareaEstadoRegistroEnum)
  
  pagination: Pagination = {
    columnSort: 'intervencionTareaId',
    typeSort: 'DESC',
    pageSize: 5,
    currentPage: 1,
    total: 0
  }

  intervencionTarea: IntervencionTareaResponse | null = null
  
  intervencionTareas = signal<IntervencionTareaResponse[]>([])

  private intervencionTareasServices = inject(IntervencionTareaService)
  private authStore = inject(AuthService)
  private modal = inject(NzModalService);

  ngOnInit(): void {
    this.permisosPCM = this.setPermisosPCM()
    this.obtenerIntervencionTareasService()
  }

  setPermisosPCM(){
    this.perfilAuth = this.authStore.usuarioAuth().codigoPerfil!
    const profilePCM = [11,12,23]
    return profilePCM.includes(this.perfilAuth)
  }

  obtenerIntervencionTareasService(){
    this.loadingTareas = true
    this.botonNuevoActivo = true
    const intervencionEspacioId = this.intervencionEspacio.intervencionEspacioId

    this.intervencionTareasServices.ListarIntervencionTareas({...this.pagination, intervencionEspacioId})
      .subscribe( resp => {
        this.loadingTareas = false
        this.intervencionTareas.set(resp.data)
        this.pagination.total = resp.info?.total
   
        resp.data.map( item => {
          if(item.estadoRegistroNombre != IntervencionTareaEstadoRegistroEnum.CULMINADO){
            this.botonNuevoActivo = false
            return
          }
        })
      })
  }

  obtenerEstadoRegistro(estadoRegistroNombre: string): string{
    const estado = this.estadosRegistros.find( item => item.text == estadoRegistroNombre)
    return estado!.value
  }

  obtenerIntervencionTareaService(tareaId: string){
    this.intervencionTareasServices.obtenerIntervencionTareas(tareaId).subscribe( resp => this.intervencionTarea = resp.data)
  }

  esResponsable(tarea:IntervencionTareaResponse){
    const sectorAuth = localStorage.getItem('codigoSector')!
    const nivelGobiernoAuth = localStorage.getItem('descripcionSector')!
    const entidad = localStorage.getItem('entidad')!
    return nivelGobiernoAuth === 'GN' ? tarea.responsableId == sectorAuth : tarea.responsableId == entidad
  }

  agregarTarea(){
    this.tareaId = 0
    this.intervencionTarea = {
      tarea: '',
      plazo: '',
      entidadId: '',
      intervencionHitoId: '',
      intervencionEspacioId: this.intervencionEspacio.intervencionId,
      responsableId: '',
      validado: false
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
    const codigoTarea = create ? '' : this.intervencionTarea!.codigo
    this.modal.create<FormularioIntervencionTareaComponent>({
      nzTitle: `${action.toUpperCase()} ${codigoTarea}`,
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
              intervencionTarea.intervencionTareaId = this.intervencionTarea!.intervencionTareaId
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
    const plazoDate = convertDateStringToDate(intervencionTarea.plazo)
    intervencionTarea.plazo = getDateFormat(plazoDate,'month')
    this.intervencionTareasServices.actualizarIntervencionTarea(intervencionTarea)
      .subscribe( resp => {
        this.obtenerIntervencionTareasService()
        this.modal.closeAll()
      })
  }

  eliminarTarea(intervencionTarea: IntervencionTareaResponse){        
    this.modal.confirm({
      nzTitle: `Eliminar tarea`,
      nzContent: `¿Está seguro de que desea eliminar la tarea ${intervencionTarea.codigo}?`,
      nzOkText: 'Eliminar',
      nzOkDanger: true,
      nzOnOk: () => {
        this.intervencionTareasServices.eliminarIntervencionTarea(intervencionTarea.intervencionTareaId!)
          .subscribe( resp => {
            if(resp.success){
              this.obtenerIntervencionTareasService()
            }
          })
      },
      nzCancelText: 'Cancelar'
    });
  }

  comentarTarea(intervencionTarea: IntervencionTareaResponse){
    this.modal.create<FormularioComentarComponent>({
      nzTitle: `COMENTAR TAREA ${intervencionTarea.codigo}`,
      nzContent: FormularioComentarComponent,
      nzFooter: [
        {
          label: 'Cancelar',
          type: 'default',
          onClick: () => this.modal.closeAll(),
        },
        {
          label: 'Guardar',
          type: 'primary',
          onClick: (componentResponse) => {
            const formComentario = componentResponse!.formComentario

            if (formComentario.invalid) {
              const invalidFields = Object.keys(formComentario.controls).filter(field => formComentario.controls[field].invalid);
              console.error('Invalid fields:', invalidFields);
              return formComentario.markAllAsTouched();
            }

            const comentario = formComentario.get('comentario')?.value

            switch (this.permisosPCM) {
              case true: intervencionTarea.comentarioSd = comentario; break;
              case false: intervencionTarea.comentario = comentario; break;
            }
            this.actualizarTareaServices(intervencionTarea)
          }
        }
      ]
    })
  }

  validarTarea(intervencionTarea: IntervencionTareaResponse){
    this.modal.confirm({
      nzTitle: `Validar tarea`,
      nzContent: `¿Está seguro de que desea validar la tarea ${intervencionTarea.codigo}?`,
      nzOkText: 'Validar',
      nzOkDanger: false,
      nzOnOk: () => {
        intervencionTarea.validado = true
        this.actualizarTareaServices(intervencionTarea)
      },
      nzCancelText: 'Cancelar'
    });
  }

  obtenerTareaAvances(intervencionTarea: IntervencionTareaResponse){
    this.tareaId = Number(intervencionTarea.intervencionTareaId)
    this.listarAvances = true
    this.intervencionTarea = intervencionTarea
  }

  actualizarListaTareas(actualiza: boolean){
    this.obtenerIntervencionTareasService()
    this.obtenerIntervencionTareaService(this.tareaId.toString())
  }

}
