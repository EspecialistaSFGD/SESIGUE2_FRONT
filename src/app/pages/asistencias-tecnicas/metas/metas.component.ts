import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Pagination, UsuarioMetaResponse } from '@core/interfaces';
import { UsuarioMetasService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormularioMetaComponent } from './formulario-meta/formulario-meta.component';
import { MetasDetallesComponent } from './metas-detalles/metas-detalles.component';

@Component({
  selector: 'app-metas',
  standalone: true,
  imports: [CommonModule, NgZorroModule, PageHeaderComponent],
  templateUrl: './metas.component.html',
  styles: ``
})
export default class MetasComponent {
  title: string = `Metas`;

  loadingData: boolean = false

  usuarios = signal<UsuarioMetaResponse[]>([])
  sectorAuth: number = 0
  entidadAuth: number = 0

  pagination: Pagination = {
    columnSort: 'nombresPersona',
    typeSort: 'ASC',
    pageSize: 15,
    currentPage: 1,
    total: 0
  }

  private usuarioMetasService = inject(UsuarioMetasService)
  private modal = inject(NzModalService);

  ngOnInit(): void {
    this.obtenerServiceUsuariosPorSector()
  }

  obtenerServiceUsuariosPorSector(){
    this.usuarioMetasService.listarUsuario(this.pagination)
      .subscribe( resp => {
        this.usuarios.set(resp.data)
        this.pagination.total = resp.info?.total ?? 0
      })
  }

  modalMetaDetalle(usuarioId: string, nombre: string): void{
    const titleModal = nombre
    const modal = this.modal.create<MetasDetallesComponent>({
      nzTitle: titleModal,
      nzWidth: '50%',
      nzContent: MetasDetallesComponent,
      nzData: {
        usuarioId
      },
      nzFooter: [
        {
          label: 'Cancelar',
          type: 'default',
          onClick: () => this.modal.closeAll(),
        }
      ]
    })
  }

  modalNuevaMeta(){
    const modal = this.modal.create<FormularioMetaComponent>({
      nzTitle: 'Nueva Meta',
      nzWidth: '50%',
      nzContent: FormularioMetaComponent,
      nzData: {
        usuarios: this.usuarios()
      },
      nzFooter: [
        {
          label: 'Cancelar',
          type: 'default',
          onClick: () => this.modal.closeAll(),
        },
        {
          label: 'Agregar Meta',
          type: 'primary',
          onClick: (componentResp) => {
            const formNewmeta = componentResp!.formMeta
            console.log('guardar formulario');
            console.log(formNewmeta.value);

            if (formNewmeta.invalid) {
              return formNewmeta.markAllAsTouched()
            }
            
            this.modal.closeAll()
            // return this.acuerdosService.solicitarDesestimacionAcuerdo(componentInstance!.desestimacionForm.value).then((res) => {
            //   this.traerAcuerdos({});
            //   this.modal.closeAll();
            // });
          }
        }
      ]
    })
  }
}
