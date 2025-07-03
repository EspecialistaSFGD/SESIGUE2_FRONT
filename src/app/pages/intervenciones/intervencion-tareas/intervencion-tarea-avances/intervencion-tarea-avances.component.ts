import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IntervencionTareaAvanceEstadoRegistroEnum, IntervencionTareaEstadoRegistroEnum } from '@core/enums';
import { convertDateStringToDate, convertEnumToObject, getDateFormat } from '@core/helpers';
import { IntervencionTareaAvanceResponse, IntervencionTareaResponse, ItemEnum, Pagination } from '@core/interfaces';
import { IntervencionTareaAvanceService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { AuthService } from '@libs/services/auth/auth.service';
import { FormularioComentarComponent } from '@shared/formulario-comentar/formulario-comentar.component';
import { SharedModule } from '@shared/shared.module';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormularioIntervencionTareaAvanceComponent } from './formulario-intervencion-tarea-avance/formulario-intervencion-tarea-avance.component';
import { IconoValidadoComponent } from '@shared/icons/icono-validado/icono-validado.component';

@Component({
  selector: 'app-intervencion-tarea-avances',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgZorroModule, SharedModule, IconoValidadoComponent],
  templateUrl: './intervencion-tarea-avances.component.html',
  styles: ``
})
export default class IntervencionTareaAvancesComponent {

  private _intervencionTarea: IntervencionTareaResponse | null = null;
  @Input()
  set intervencionTarea(value: IntervencionTareaResponse | null) {
    this._intervencionTarea = value;
    if (value?.intervencionTareaId) {
      this.verificarTareaAvances()
    }
  }
  get intervencionTarea(): IntervencionTareaResponse | null {
    return this._intervencionTarea;
  }
  @Output() tareaUpdated = new EventEmitter<boolean>()

  loading: boolean = false
  permisosPCM: boolean = false
  perfilAuth: number = 0
  esResponsable: boolean = false
  tareaProyectoCulminado: boolean = false
  tareaCulminado: boolean = false
  estadosRegistros: ItemEnum[] = convertEnumToObject(IntervencionTareaAvanceEstadoRegistroEnum)

  pagination: Pagination = {
    columnSort: 'intervencionAvanceId',
    typeSort: 'DESC',
    pageSize: 5,
    currentPage: 1,
    total: 0
  }

  intervencionTareasAvances = signal<IntervencionTareaAvanceResponse[]>([])

  private intervencionTareaAvanceServices = inject(IntervencionTareaAvanceService)
  private authStore = inject(AuthService)
  private modal = inject(NzModalService);


  verificarTareaAvances(){    
    this.tareaProyectoCulminado = this.intervencionTarea?.estadoRegistroNombre?.toLowerCase() == IntervencionTareaEstadoRegistroEnum.PROYECTO_CULMINADO
    this.tareaCulminado = this.intervencionTarea?.estadoRegistroNombre?.toLowerCase() == IntervencionTareaEstadoRegistroEnum.CULMINADO
    this.obtenerInversionTareaAvanceService()
    this.permisosPCM = this.setPermisosPCM()    
  }

  setPermisosPCM(){
    this.perfilAuth = this.authStore.usuarioAuth().codigoPerfil!
    const profilePCM = [11,12,23]
    return profilePCM.includes(this.perfilAuth)
  }

  verificarResponsable(){
    const sectorAuth = localStorage.getItem('codigoSector')!
    const nivelGobiernoAuth = localStorage.getItem('descripcionSector')!
    const entidad = localStorage.getItem('entidad')!
    this.esResponsable = nivelGobiernoAuth === 'GN' ? this.intervencionTarea!.responsableId == sectorAuth : this.intervencionTarea!.responsableId == entidad
  }

  obtenerInversionTareaAvanceService(){
    this.pagination.intervencionTareaId = this.intervencionTarea!.intervencionTareaId
    this.loading = true
    this.intervencionTareaAvanceServices.ListarIntervencionTareaAvances(this.pagination)
      .subscribe( resp => {
        this.loading = false
        this.intervencionTareasAvances.set(resp.data)
        this.pagination.total = resp.info!.total
      })
  }

  agregarAvance(){
    this.intervencionTareaAvanceForm(true)
  }

  intervencionTareaAvanceForm(create: boolean){
    const action = `${create ? 'Crear' : 'Actualizar' } Avance`
    this.modal.create<FormularioIntervencionTareaAvanceComponent>({
      nzTitle: `${action.toUpperCase()}`,
      nzContent: FormularioIntervencionTareaAvanceComponent,
      nzData: {
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
            const formTareaAvance = componentResponse!.formTareaAvance
            if (formTareaAvance.invalid) {
              const invalidFields = Object.keys(formTareaAvance.controls).filter(field => formTareaAvance.controls[field].invalid);
              console.error('Invalid fields:', invalidFields);
              return formTareaAvance.markAllAsTouched();
            }

             const dateFecha =  new Date(formTareaAvance.get('fecha')?.value)
            const fechaDateFormat =  getDateFormat(dateFecha,'month')
            formTareaAvance.get('fecha')?.setValue(fechaDateFormat)

            const intervencionTareaId = this.intervencionTarea!.intervencionTareaId!
            const accesoId = localStorage.getItem('codigoUsuario')!
            
            const body: IntervencionTareaAvanceResponse = {
              ...formTareaAvance.value,
              intervencionTareaId
            }

            if(create){
              body.accesoId = accesoId
              this.crearIntervencionTareaAvance(body)
            }

          }
        }
      ]
    })
  }

  crearIntervencionTareaAvance(intervencionTareaAvance: IntervencionTareaAvanceResponse){
    this.intervencionTareaAvanceServices.registarIntervencionTareaAvance(intervencionTareaAvance)
      .subscribe( resp => {          
        this.verificarTareaAvances()
        this.tareaUpdated.emit(true)
        this.modal.closeAll()
      })
  }

  comentarTarea(intervencionTareaAvance: IntervencionTareaAvanceResponse){
    this.modal.create<FormularioComentarComponent>({
      nzTitle: `COMENTAR AVANCE`,
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

            this.permisosPCM
            ? intervencionTareaAvance.comentarioSd = comentario
            : intervencionTareaAvance.comentario = comentario

            const fechaDate = convertDateStringToDate(intervencionTareaAvance.fecha)
            intervencionTareaAvance.fecha = getDateFormat(fechaDate,'month')

            this.actualizartareaService(intervencionTareaAvance)
          }
        }
      ]
    })
  }

  verificarProyectoCulminadoAvance(estadoRegistroNombre: string): boolean{
    return this.tareaProyectoCulminado && estadoRegistroNombre == IntervencionTareaAvanceEstadoRegistroEnum.PROYECTO_CULMINADO
  }

  validarAvance(intervencionTareaAvance: IntervencionTareaAvanceResponse){
    this.modal.confirm({
      nzTitle: `Validar avance`,
      nzContent: `¿Está seguro de que desea validar el avance del  ${intervencionTareaAvance.fecha}?`,
      nzOkText: 'Validar',
      nzOkDanger: false,
      nzOnOk: () => {
      const fechaDate = convertDateStringToDate(intervencionTareaAvance.fecha)
      this.permisosPCM ? intervencionTareaAvance.validaPcm = true : intervencionTareaAvance.validado = true
      intervencionTareaAvance.fecha = getDateFormat(fechaDate,'month')
        this.actualizartareaService(intervencionTareaAvance)
      },
      nzCancelText: 'Cancelar'
    });
  }

  eliminarTarea(intervencionTareaAvance: IntervencionTareaAvanceResponse){
    this.modal.confirm({
      nzTitle: `Eliminar avance`,
      nzContent: `¿Está seguro de que desea eliminar el avance del ${intervencionTareaAvance.fecha}?`,
      nzOkText: 'Eliminar',
      nzOkDanger: true,
      nzOnOk: () => {
        this.intervencionTareaAvanceServices.eliminarIntervencionTareaAvance(intervencionTareaAvance.intervencionAvanceId!)
          .subscribe( resp => {
            if(resp.success){
              this.tareaUpdated.emit(true)
              this.verificarTareaAvances()
            }
          })
      },
      nzCancelText: 'Cancelar'
    });
  }

  actualizartareaService(intervencionTareaAvance: IntervencionTareaAvanceResponse){
    intervencionTareaAvance.estadoRegistro = intervencionTareaAvance.estadoRegistroNombre!
    this.intervencionTareaAvanceServices.actualizarIntervencionTareaAvance(intervencionTareaAvance)
      .subscribe( resp => {
        this.tareaUpdated.emit(true)
        this.verificarTareaAvances()
        this.modal.closeAll()
      })
  }

}
