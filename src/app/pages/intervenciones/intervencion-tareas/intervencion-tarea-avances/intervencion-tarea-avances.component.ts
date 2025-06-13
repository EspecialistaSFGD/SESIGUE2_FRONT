import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IntervencionTareaAvanceResponse, IntervencionTareaResponse, Pagination } from '@core/interfaces';
import { DescargarService, IntervencionTareaAvanceService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormularioIntervencionTareaAvanceComponent } from './formulario-intervencion-tarea-avance/formulario-intervencion-tarea-avance.component';
import { convertDateStringToDate, generateBase64ToArrayBuffer, getDateFormat } from '@core/helpers';
import saveAs from 'file-saver';
import { FormularioComentarComponent } from '@shared/formulario-comentar/formulario-comentar.component';
import { AuthService } from '@libs/services/auth/auth.service';

@Component({
  selector: 'app-intervencion-tarea-avances',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgZorroModule],
  templateUrl: './intervencion-tarea-avances.component.html',
  styles: ``
})
export default class IntervencionTareaAvancesComponent {

  @Input() intervencionTarea: IntervencionTareaResponse | null = null
  @Output() tareaUpdated = new EventEmitter<boolean>()

  loading: boolean = false
  permisosPCM: boolean = false
  perfilAuth: number = 0
  tareaCulminado: boolean = false

  intervencionTareasAvances = signal<IntervencionTareaAvanceResponse[]>([])

  private intervencionTareaAvanceServices = inject(IntervencionTareaAvanceService)
  private authStore = inject(AuthService)
  private modal = inject(NzModalService);
  private descargarService = inject(DescargarService)

  paginationAvance: Pagination = {
    columnSort: 'intervencionAvanceId',
    typeSort: 'DESC',
    pageSize: 5,
    currentPage: 1,
    total: 0
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.obtenerInversionTareaAvanceService()
  }

  ngOnInit(): void {    
    this.tareaCulminado = this.intervencionTarea?.estadoRegistroNombre?.toLowerCase() == 'culminado'
    this.permisosPCM = this.setPermisosPCM()    
  }

  setPermisosPCM(){
    this.perfilAuth = this.authStore.usuarioAuth().codigoPerfil!
    const profilePCM = [11,12,23]
    return profilePCM.includes(this.perfilAuth)
  }

  obtenerInversionTareaAvanceService(){
    this.paginationAvance.intervencionTareaId = this.intervencionTarea!.intervencionTareaId
    this.loading = true
    this.intervencionTareaAvanceServices.ListarIntervencionTareaAvances(this.paginationAvance)
      .subscribe( resp => {
        this.loading = false
        this.intervencionTareasAvances.set(resp.data)
        this.paginationAvance.total = resp.info!.total
      })
  }

  descargarPdf(archivo: string){
      this.descargarService.descargarPdf(archivo)
        .subscribe((resp) => {        
          if (resp.success == true) {
            var binary_string = generateBase64ToArrayBuffer(resp.data.binario);
            var blob = new Blob([binary_string], { type: `application/${resp.data.tipo}` });
            saveAs(blob, resp.data.nombre);
          }
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
        // this.obtenerInversionTareaAvanceService()
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

            if(this.permisosPCM){
              intervencionTareaAvance.comentarioSd = comentario
            }

            const fechaDate = convertDateStringToDate(intervencionTareaAvance.fecha)
            intervencionTareaAvance.fecha = getDateFormat(fechaDate,'month')

            this.actualizartareaService(intervencionTareaAvance)
          }
        }
      ]
    })
  }

  validarTarea(intervencionTareaAvance: IntervencionTareaAvanceResponse){
    const fechaDate = convertDateStringToDate(intervencionTareaAvance.fecha)
    intervencionTareaAvance.validado = true
    intervencionTareaAvance.fecha = getDateFormat(fechaDate,'month')
    this.actualizartareaService(intervencionTareaAvance)
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
              // this.obtenerInversionTareaAvanceService()
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
        this.obtenerInversionTareaAvanceService()
        this.modal.closeAll()
      })
  }

}
