import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { ItemEnum, MesaDocumentoResponse, MesaResponse, Pagination } from '@core/interfaces';
import { MesaDocumentosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { SharedModule } from '@shared/shared.module';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormularioMesaDocumentoComponent } from './formulario-mesa-documento/formulario-mesa-documento.component';
import { convertEnumToObject, getDateFormat } from '@core/helpers';
import { MesaDocumentoTipoEnum } from '@core/enums';

@Component({
  selector: 'app-documentos-mesa',
  standalone: true,
  imports: [CommonModule, PrimeNgModule, NgZorroModule, SharedModule],
  templateUrl: './documentos-mesa.component.html',
  styles: ``
})
export class DocumentosMesaComponent {
  @Input() mesa!: MesaResponse
  @Input() tipo: number = 0
  
  loading: boolean = false
  tipos: ItemEnum[] = convertEnumToObject(MesaDocumentoTipoEnum)

  documentos = signal<MesaDocumentoResponse[]>([])

  pagination: Pagination = {
    columnSort: 'documentoId',
    typeSort: 'DESC',
    pageSize: 5,
    currentPage: 1,
    total: 0
  }

  private mesaDocumentosServices = inject(MesaDocumentosService)
  private modal = inject(NzModalService);

  ngOnInit(): void {
    setTimeout(() => {
      this.obtenerDocumentosService()
    }, 500);
  }

  obtenerDocumentosService(){
    this.loading = true 
    const mesaId = Number(this.mesa.mesaId!)
    
    this.mesaDocumentosServices.ListarMesaDetalle(mesaId, this.tipo, this.pagination)
      .subscribe( resp => {
        this.pagination.total = resp.info!.total
        this.documentos.set(resp.data);
      })
  }

  crearDocumento() {
      const documento = this.tipos.find( item => Number(item.text) == this.tipo )!
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
                mesaId: this.mesa.mesaId!
              }
  
              this.mesaDocumentosServices.registarMesaDetalle(mesaDetalle)
                .subscribe( resp => {
                  if(resp.success){
                    this.modal.closeAll()
                    this.obtenerDocumentosService()
                  }
                })
            }
          }
        ],
      });
    }


  deleteDocumento(documento: MesaDocumentoResponse) {
    const title = this.tipo == 1 ? 'AM' : 'SESIÓN'
    this.modal.confirm({
      nzTitle: `Eliminar ${title}`,
      nzContent: `¿Está seguro de que desea eliminar el archivo ${documento.nombre} del ${documento.fechaCreacion}?`,
      nzOkText: 'Eliminar',
      nzOkDanger: true,
      nzOnOk: () => {
        this.mesaDocumentosServices.eliminarMesaDetalle(documento.documentoId!)
          .subscribe( resp => {
            if(resp.success){
              this.obtenerDocumentosService()
            }
          })
      },
      nzCancelText: 'Cancelar'
    });
  }

}
