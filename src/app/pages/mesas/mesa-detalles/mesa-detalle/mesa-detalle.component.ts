import { CommonModule } from '@angular/common';
import { Component, inject, input, Input, signal } from '@angular/core';
import { MesaDocumentoTipoEnum } from '@core/enums';
import { convertEnumToObject, getDateFormat } from '@core/helpers';
import { ItemEnum, MesaDocumentoResponse, MesaResponse } from '@core/interfaces';
import { MesaDocumentosService, MesasService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { SharedModule } from '@shared/shared.module';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormularioMesaComponent } from '../../formulario-mesa/formulario-mesa.component';
import { FormularioMesaDocumentoComponent } from '../formulario-mesa-documento/formulario-mesa-documento.component';

@Component({
  selector: 'app-mesa-detalle',
  standalone: true,
  imports: [CommonModule, SharedModule, NgZorroModule],
  templateUrl: './mesa-detalle.component.html',
  styles: ``
})
export class MesaDetalleComponent {
  @Input() mesa!: MesaResponse
  @Input() action: boolean = true

  tipos: ItemEnum[] = convertEnumToObject(MesaDocumentoTipoEnum)

  documentosResolucion = signal<MesaDocumentoResponse[]>([])
    
  private mesaServices = inject(MesasService)
  private mesaDetalleServices = inject(MesaDocumentosService)

  private modal = inject(NzModalService);

  actualizarMesaService(mesa: MesaResponse){
    this.mesaServices.actualizarMesa(mesa)
      .subscribe( resp => {
        if(resp.success == true){
          // this.obtenerMesaService()
          this.modal.closeAll();
        }
      })
  }


  actualizarMesa(){
      this.modal.create<FormularioMesaComponent>({
        nzTitle: `Actualizar Mesa`,
        nzWidth: '75%',
        nzContent: FormularioMesaComponent,
        nzData: {
          create: false,
          mesa: this.mesa,
        },
        nzFooter: [
          {
            label: 'Cancelar',
            type: 'default',
            onClick: () => this.modal.closeAll(),
          },
          {
            label: 'Actualizar Mesa',
            type: 'primary',
            onClick: (componentResponse) => {
              const formMesa = componentResponse!.formMesa
             
              if (formMesa.invalid) {
                const invalidFields = Object.keys(formMesa.controls).filter(field => formMesa.controls[field].invalid);
                console.error('Invalid fields:', invalidFields);
                return formMesa.markAllAsTouched();
              }
  
              const mesaId = this.mesa.mesaId
              const fechaCreacion = getDateFormat(formMesa.get('fechaCreacion')?.value, 'month')
              const fechaVigencia = getDateFormat(formMesa.get('fechaVigencia')?.value, 'month')
              const usuarioId =localStorage.getItem('codigoUsuario')
  
              const bodyMesa: MesaResponse = {...formMesa.getRawValue() , fechaCreacion, fechaVigencia, usuarioId, mesaId}
              this.actualizarMesaService(bodyMesa)
            }
          }
        ]
      })
    }

  modalCreateFile(tipo: number) {
    const documento = this.tipos.find( item => Number(item.text) == tipo )!
    const titulo = documento.text === MesaDocumentoTipoEnum.RESOLUCION ? 'AMPLIACIÓN' : documento?.value
    this.modal.create<FormularioMesaDocumentoComponent>({
      nzTitle: `AGREGAR ${titulo.toUpperCase()}`,
      nzContent: FormularioMesaDocumentoComponent,
      nzData: {
      },
      nzFooter: [
        {
          label: 'Cancelar',
          type: 'default',
          onClick: () => this.modal.closeAll(),
        },
        {
          label: `Guardar`,
          type: 'primary',
          onClick: (componentResponse) => {
            const formMesaDetalle = componentResponse!.formMesaDocumento

            if (formMesaDetalle.invalid) {
              const invalidFields = Object.keys(formMesaDetalle.controls).filter(field => formMesaDetalle.controls[field].invalid);
              console.error('Invalid fields:', invalidFields);
              return formMesaDetalle.markAllAsTouched();
            }

            const usuarioId = localStorage.getItem('codigoUsuario')
            const fechaCreacion = getDateFormat(formMesaDetalle.get('fechaCreacion')?.value, 'month')
            const mesaDetalle = {
              ...formMesaDetalle.value,
              fechaCreacion,
              usuarioId,
              tipo: documento?.text.toLowerCase(),
              mesaId: this.mesa.mesaId
            }

            this.mesaDetalleServices.registarMesaDetalle(mesaDetalle)
              .subscribe( resp => {
                if(resp.success){
                  this.modal.closeAll()
                  // this.obtenerDetalleMesa(tipo)
                }
              })
          }
        }
      ],
    });
  }
}
