import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { MesaResponse, MesaUbigeoResponse, Pagination } from '@core/interfaces';
import { MesaUbigeosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormularioIntegranteMesaComponent } from './formulario-integrante-mesa/formulario-integrante-mesa.component';

@Component({
  selector: 'app-integrantes-mesa',
  standalone: true,
  imports: [CommonModule, NgZorroModule],
  templateUrl: './integrantes-mesa.component.html',
  styles: ``
})
export class IntegrantesMesaComponent {
  @Input() mesaId!: number
  @Input() esSector:boolean = true

  integrantes = signal<MesaUbigeoResponse[]>([])
  modal = inject(NzModalService);

  integrante: MesaUbigeoResponse = {
    mesaId: '',
    entidadId: '',
    alcaldeAsistenteId: '',
    esSector: this.esSector
  }

  loading: boolean = false
  pagination: Pagination = {
    columnSort: 'fechaRegistro',
    typeSort: 'DESC',
    pageSize: 5,
    currentPage: 1,
    total: 0
  }

  private integrantesService = inject(MesaUbigeosService)

  ngOnInit(): void {
    this.obtenerIntegrantesService()
  }

  obtenerIntegrantesService(){
    this.loading = true
    this.pagination.esSector = this.esSector ? '1' : '0'
    this.integrantesService.ListarMesaUbigeos(this.mesaId.toString(), this.pagination)
      .subscribe( resp => {
        console.log(resp.data);                
        this.loading = false
        this.integrantes.set(resp.data)
        this.pagination.total = resp.info!.total
      })
  }

  nuevoIntegrante(){
    this.formularioIntegrante()
  }

  actualizarIntegrante(integrante: MesaUbigeoResponse){
    this.integrante = integrante
    this.formularioIntegrante(false)
  }

  formularioIntegrante(create: boolean = true){
    const title = create ? 'AGREGAR' : 'ACTUALIZAR'
    this.modal.create<FormularioIntegranteMesaComponent>({
      nzTitle: `${title} INTEGRANTE`,
      // nzWidth: '75%',
      nzContent: FormularioIntegranteMesaComponent,
      nzData: {
        create: create,
        integrante: this.integrante,
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
          }
        }
      ]
    })
  }
}
