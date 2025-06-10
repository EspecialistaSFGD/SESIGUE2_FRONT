import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { getDateFormat } from '@core/helpers';
import { MesaResponse, MesaIntegranteResponse, Pagination, MesaEstadoResponse } from '@core/interfaces';
import { MesaEstadosService, MesaIntegrantesService } from '@core/services';
import { MesasService } from '@core/services/mesas.service';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { AuthService } from '@libs/services/auth/auth.service';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { SharedModule } from '@shared/shared.module';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormularioMesaComponent } from './formulario-mesa/formulario-mesa.component';
import { FormularioMesaEstadoResumenComponent } from './formulario-mesa-estado-resumen/formulario-mesa-estado-resumen.component';

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [CommonModule, RouterModule, NgZorroModule, PageHeaderComponent, SharedModule],
  templateUrl: './mesas.component.html',
  styles: ``
})
export default class MesasComponent {
  title: string = `Mesas`;
  
  loadingData: boolean = false
  permisosPCM: boolean = false
  perfilAuth: number = 0

  pagination: Pagination = {
    code: 0,
    columnSort: 'mesaId',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  mesa = signal<MesaResponse>({
    nombre: '',
    abreviatura: '',
    sectorId: '',
    secretariaTecnicaId: '',
    fechaCreacion: '',
    fechaVigencia: '',
    resolucion: '',
    estadoRegistroNombre: '',
    estadoRegistro: '',
    usuarioId: ''
  })

  mesas = signal<MesaResponse[]>([])

  private authStore = inject(AuthService)
  private modal = inject(NzModalService);
  private mesasService = inject(MesasService)
  private mesaUbigeosService = inject(MesaIntegrantesService)
  private mesaEstadosService = inject(MesaEstadosService)

  ngOnInit(): void {
    this.perfilAuth = this.authStore.usuarioAuth().codigoPerfil!
    this.permisosPCM = this.setPermisosPCM()
    this.obtenerMesasService()
  }

  setPermisosPCM(){
    const profilePCM = [11,12,23]
    return profilePCM.includes(this.perfilAuth)
  }

  obtenerMesasService(){
    this.mesasService.ListarMesas(this.pagination)
      .subscribe( resp => {
        this.mesas.set(resp.data)
        this.pagination.total = resp.info?.total
      })
  }

  crearMesa(){
    this.mesasFormModal(true)
  }

  mesasFormModal(create: boolean): void{
    const action = `${create ? 'Crear' : 'Actualizar' } mesa`
    this.modal.create<FormularioMesaComponent>({
      nzTitle: `${action.toUpperCase()}`,
      nzWidth: '75%',
      nzContent: FormularioMesaComponent,
      nzData: {
        create,
        mesa: this.mesa
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
            const formMesa = componentResponse!.formMesa
           
            if (formMesa.invalid) {
              const invalidFields = Object.keys(formMesa.controls).filter(field => formMesa.controls[field].invalid);
              console.error('Invalid fields:', invalidFields);
              return formMesa.markAllAsTouched();
            }

            const fechaCreacion = getDateFormat(formMesa.get('fechaCreacion')?.value, 'month')
            const fechaVigencia = getDateFormat(formMesa.get('fechaVigencia')?.value, 'month')
            const usuarioId =localStorage.getItem('codigoUsuario')

            const bodyMesa: MesaResponse = {...formMesa.getRawValue() , fechaCreacion, fechaVigencia, usuarioId}

            this.loadingData = true
            if(create){
              this.registrarMesaService(bodyMesa)
            }
                        
          }
        }
      ]
    })
  }

  registrarMesaService(mesa: MesaResponse) {
    this.mesasService.registarMesa(mesa)
      .subscribe( resp => {
        this.loadingData = false
        if(resp.success == true){
          const mesaId = resp.data
          const ubigeos: MesaIntegranteResponse[] = mesa.ubigeos!
          const sectores: MesaIntegranteResponse[] = mesa.sectores!          
          const integrantes: MesaIntegranteResponse[] = [ ...ubigeos, ...sectores ];

            for (let integrante of integrantes) {
              integrante.alcaldeAsistenteId = `${integrante.alcaldeAsistenteId}`
              this.mesaUbigeosService.registarMesaIntegrante(mesaId, integrante)
                .subscribe(resp => {
                this.obtenerMesasService();
                this.modal.closeAll();
                });
            }
        }
      })
  }

  crearEstadoResumen(mesaId: string){
    this.modal.create<FormularioMesaEstadoResumenComponent>({
      nzTitle: `AGREGAR ESTADO RESUMEN`,
      nzContent: FormularioMesaEstadoResumenComponent,
      nzFooter: [
        {
          label: 'Cancelar',
          type: 'default',
          onClick: () => this.modal.closeAll(),
        },
        {
          label: 'Agregar',
          type: 'primary',
          onClick: (componentResponse) => {
            const formEstado = componentResponse!.formEstado
           
            if (formEstado.invalid) {
              const invalidFields = Object.keys(formEstado.controls).filter(field => formEstado.controls[field].invalid);
              console.error('Invalid fields:', invalidFields);
              return formEstado.markAllAsTouched();
            }

            const fecha = getDateFormat(formEstado.get('fecha')?.value, 'month')
            const usuarioId =localStorage.getItem('codigoUsuario')
            const bodyEstado: MesaEstadoResponse = { ...formEstado.value, mesaId, fecha, usuarioId }
            this.registrarMesaEstado(bodyEstado)
          }
        }
      ]
    })
  }

  registrarMesaEstado(mesaEstado: MesaEstadoResponse) {
    this.mesaEstadosService.registarMesaDetalle(mesaEstado)
      .subscribe( resp => {
        if(resp.success == true){
          this.obtenerMesasService()
          this.modal.closeAll()
        }
      })
  }
}
