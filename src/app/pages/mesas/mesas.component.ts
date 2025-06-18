import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { getDateFormat } from '@core/helpers';
import { MesaResponse, MesaIntegranteResponse, Pagination, MesaEstadoResponse } from '@core/interfaces';
import { IntervencionEspacioService, MesaEstadosService, MesaIntegrantesService } from '@core/services';
import { MesasService } from '@core/services/mesas.service';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { AuthService } from '@libs/services/auth/auth.service';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { SharedModule } from '@shared/shared.module';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormularioMesaComponent } from './formulario-mesa/formulario-mesa.component';
import { FormularioMesaEstadoResumenComponent } from './formulario-mesa-estado-resumen/formulario-mesa-estado-resumen.component';
import saveAs from 'file-saver';
import { UtilesService } from '@libs/shared/services/utiles.service';
import { FiltroMesasComponent } from './filtro-mesas/filtro-mesas.component';

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [CommonModule, RouterModule, NgZorroModule, PageHeaderComponent, SharedModule, FiltroMesasComponent],
  templateUrl: './mesas.component.html',
  styles: ``
})
export default class MesasComponent {
  title: string = `Mesas`;
  
  loadingExport: boolean = false
  loading: boolean = false
  permisosPCM: boolean = false
  perfilAuth: number = 0
  openFilters: boolean = false

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
  private intervencionEspaciosServices = inject(IntervencionEspacioService)
  private mesaUbigeosService = inject(MesaIntegrantesService)
  private mesaEstadosService = inject(MesaEstadosService)
  private utilesService = inject(UtilesService);

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

  changeVisibleDrawer(visible: boolean){
    this.openFilters = false
  }

  reporteMesas(){
    this.loadingExport = true;
    this.mesasService.reporteMesas(this.pagination)
      .subscribe( resp => {
        if(resp.data){
          const data = resp.data;
          this.generarExcel(data.archivo, data.nombreArchivo);
        }
        this.loadingExport = false
      })
  }

  reporteIntervencion(){
    this.loadingExport = true;
    const pagination: Pagination = { origenId: '1' }
    this.intervencionEspaciosServices.reporteIntervencionEspacios({ origenId: '1' })
      .subscribe( resp => {
        if(resp.data){
          const data = resp.data;
          this.generarExcel(data.archivo, data.nombreArchivo);
        }
        this.loadingExport = false
      })
  }
  
  generarExcel(archivo: any, nombreArchivo: string): void {
    const arrayBuffer = this.utilesService.base64ToArrayBuffer(archivo);
    const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, nombreArchivo);
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

            this.loading = true
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
        this.loading = false
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

  crearEstadoResumen(mesa: MesaResponse, esAlerta: boolean){
    const title = esAlerta ? 'ALERTA' : 'ESTADO RESUMEN'
    this.modal.create<FormularioMesaEstadoResumenComponent>({
      nzTitle: `AGREGAR ${title} A MESA ${mesa.codigo}`,
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
            const tipo = esAlerta ? 1 : 0
            const mesaId = mesa.mesaId
            const bodyEstado: MesaEstadoResponse = { ...formEstado.value, tipo, mesaId, fecha, usuarioId }
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
