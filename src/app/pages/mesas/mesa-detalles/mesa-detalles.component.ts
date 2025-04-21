import { CommonModule } from '@angular/common';
import { Component, inject, signal, Signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MesaDetalleResponse, MesaFilesResponse, MesaResponse, Pagination } from '@core/interfaces';
import { MesaDetallesService, MesasService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { SharedModule } from '@shared/shared.module';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormularioMesaDetalleComponent } from './formulario-mesa-detalle/formulario-mesa-detalle.component';

@Component({
  selector: 'app-mesa-detalles',
  standalone: true,
  imports: [CommonModule, RouterModule , NgZorroModule, SharedModule],
  templateUrl: './mesa-detalles.component.html',
  styles: ``
})
export default class MesaDetallesComponent {
  title: string = `Mesas`;

  files: MesaFilesResponse[] = [
    {id: '1', archivo: '', nombreArchivo: 'archivo-1.pdf', usuario: 'Dario', fecha: '07/03/2024' },
    {id: '2', archivo: '', nombreArchivo: 'archivo-1.pdf', usuario: 'Denisse', fecha: '22/02/2024' },
    {id: '3', archivo: '', nombreArchivo: 'archivo-1.pdf', usuario: 'Cecilia', fecha: '15/01/2024' },
    {id: '4', archivo: '', nombreArchivo: 'archivo-1.pdf', usuario: 'Pamela', fecha: '28/12/2023' },
    {id: '5', archivo: '', nombreArchivo: 'archivo-1.pdf', usuario: 'Veronica', fecha: '12/11/2023' },
  ]

  mesaId!: number
  mesa = signal<MesaResponse>({
    codigo: '',
    nombre: '',
    estadoInternoNombre: '',
    estadoInterno: '',
    fechaRegistro: new Date()
  })
  mesasSesion = signal<MesaDetalleResponse[]>([])
  mesasAm = signal<MesaDetalleResponse[]>([])

  loadingDataSesion: boolean = false
  loadingDataAm: boolean = false

  paginationSesion: Pagination = {
    columnSort: 'fechaRegistro',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  paginationAm: Pagination = {
    columnSort: 'fechaRegistro',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  private mesaServices = inject(MesasService)
  private mesaDetalleServices = inject(MesaDetallesService)
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private modal = inject(NzModalService);

  ngOnInit(): void {
    this.verificarMesa()
    this.obtenerDetalleMesa(0)
    this.obtenerDetalleMesa(1)
  }

  verificarMesa(){
    const mesaId = this.route.snapshot.params['id'];
    const mesaIdNumber = Number(mesaId);
    if (isNaN(mesaIdNumber)) {
      this.router.navigate(['/mesas']);
      return;
    }

    this.mesaId = mesaIdNumber    
    this.mesaServices.obtenerMesa(mesaId)
      .subscribe( resp => {
        if(resp.success){
          this.mesa.set(resp.data)
        } else {
          this.router.navigate(['/mesas']);
        }
      })
  }

  obtenerDetalleMesa(tipo: number){     
    tipo == 1 ? this.loadingDataAm = true : this.loadingDataSesion = true
    const pagination = tipo == 1 ? this.paginationAm : this.paginationSesion
    this.mesaDetalleServices.ListarMesas(this.mesaId, tipo, pagination)
      .subscribe( resp => {
        tipo == 1 ? this.mesasAm.set(resp.data) : this.mesasSesion.set(resp.data)
        tipo == 1 ? this.paginationAm.total = resp.info!.total : this.paginationSesion.total = resp.info!.total

        tipo == 1 ? this.loadingDataAm = false : this.loadingDataSesion = false
      })
  }

  setNameFile(archivo: string): string {
    const dataFile = archivo.split('/')
    const fileName = dataFile[dataFile.length - 1]
    return fileName
  }


  modalCreateFile(tipo: number) {
    const action = tipo == 1 ? 'AM' : 'SESIÓN'
    const modal = this.modal.create<FormularioMesaDetalleComponent>({
      nzTitle: `AGREGAR ${action.toUpperCase()}`,
      nzContent: FormularioMesaDetalleComponent,
      nzData: {
      },
      nzFooter: [
        {
          label: 'Cancelar',
          type: 'default',
          onClick: () => this.modal.closeAll(),
        },
        {
          label: `Guardar ${action.toLowerCase()}`,
          type: 'primary',
          onClick: (componentResponse) => {
            const formMesaDetalle = componentResponse!.formMesaDetalle

            if (formMesaDetalle.invalid) {
              const invalidFields = Object.keys(formMesaDetalle.controls).filter(field => formMesaDetalle.controls[field].invalid);
              console.error('Invalid fields:', invalidFields);
              return formMesaDetalle.markAllAsTouched();
            }

            const usuarioId = localStorage.getItem('codigoUsuario')
            const mesaDetalle = {
              ...formMesaDetalle.value,
              usuarioId,
              tipo: tipo == 1 ? 'am' : 'sesion',
              mesaId: this.mesaId
            }

            this.mesaDetalleServices.registarMesaDetalle(mesaDetalle)
              .subscribe( resp => {
                if(resp.success){
                  this.modal.closeAll()
                  this.obtenerDetalleMesa(tipo)
                }
              })
          }
        }
      ],
    });
  }

  deleteMesaDetalle(detalle: MesaDetalleResponse, tipo: number) {
    const title = tipo == 1 ? 'AM' : 'SESIÓN'
    this.modal.confirm({
      nzTitle: `Eliminar ${title}`,
      nzContent: `¿Está seguro de que desea eliminar el archivo ${this.setNameFile(detalle.archivo)}?`,
      nzOkText: 'Eliminar',
      nzOkDanger: true,
      nzOnOk: () => {
        this.mesaDetalleServices.eliminarMesaDetalle(detalle.detalleId!)
          .subscribe( resp => {
            if(resp.success){
              this.obtenerDetalleMesa(tipo)
            }
          })
      },
      nzCancelText: 'Cancelar'
    });
  }
}
