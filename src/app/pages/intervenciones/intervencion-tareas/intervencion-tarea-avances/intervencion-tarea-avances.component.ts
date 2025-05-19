import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IntervencionTareaAvanceResponse, IntervencionTareaResponse, Pagination } from '@core/interfaces';
import { DescargarService, IntervencionTareaAvanceService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormularioIntervencionTareaAvanceComponent } from './formulario-intervencion-tarea-avance/formulario-intervencion-tarea-avance.component';
import { generateBase64ToArrayBuffer, getDateFormat } from '@core/helpers';
import saveAs from 'file-saver';

@Component({
  selector: 'app-intervencion-tarea-avances',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgZorroModule],
  templateUrl: './intervencion-tarea-avances.component.html',
  styles: ``
})
export default class IntervencionTareaAvancesComponent {
  @Input() intervencionTarea: IntervencionTareaResponse | null = null

  loadindAvances: boolean = false

  intervencionTareasAvances = signal<IntervencionTareaAvanceResponse[]>([])

  private intervencionTareaAvanceServices = inject(IntervencionTareaAvanceService)
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

  obtenerInversionTareaAvanceService(){
    this.paginationAvance.intervencionTareaId = this.intervencionTarea!.intervencionTareaId
    this.loadindAvances = true
    this.intervencionTareaAvanceServices.ListarIntervencionTareaAvances(this.paginationAvance)
      .subscribe( resp => {
        this.loadindAvances = false
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
      console.log(intervencionTareaAvance)
      this.intervencionTareaAvanceServices.registarIntervencionTareaAvance(intervencionTareaAvance)
        .subscribe( resp => {          
          this.obtenerInversionTareaAvanceService()
          this.modal.closeAll()
        })

  }

}
