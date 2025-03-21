import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Pagination, UsuarioResponse } from '@core/interfaces';
import { UsuariosService } from '@core/services/usuarios.service';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { AuthService } from '@libs/services/auth/auth.service';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { MetasDetallesComponent } from './metas-detalles/metas-detalles.component';
import { FormularioMetaComponent } from './formulario-meta/formulario-meta.component';

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

  usuarios = signal<UsuarioResponse[]>([])
  sectorAuth: number = 0
  entidadAuth: number = 0

  pagination: Pagination = {
    columnSort: 'nombresPersona',
    typeSort: 'acs',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  private authStore = inject(AuthService)
  private usuariosService = inject(UsuariosService)
  private modal = inject(NzModalService);

  ngOnInit(): void {
    this.sectorAuth = Number(this.authStore.usuarioAuth().sector!.value)    
    this.entidadAuth = Number(localStorage.getItem('entidad'))
    this.obtenerServiceUsuariosPorSector()
  }

  obtenerServiceUsuariosPorSector(){
    this.pagination.sectorId = this.sectorAuth
    this.pagination.entidadId = this.entidadAuth
    this.usuariosService.listarUsuario(this.pagination, [11,12])
      .subscribe( resp => {        
        this.usuarios.set(resp.data)
        if(resp.data.length > 0){
          this.pagination.total = resp.data[0].total
        }
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
