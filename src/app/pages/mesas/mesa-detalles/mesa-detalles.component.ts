import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { getDateFormat } from '@core/helpers';
import { MesaDetalleResponse, MesaResponse, MesaUbigeoResponse, Pagination } from '@core/interfaces';
import { MesaDetallesService, MesasService, MesaUbigeosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { SharedModule } from '@shared/shared.module';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormularioMesaDetalleComponent } from './formulario-mesa-detalle/formulario-mesa-detalle.component';
import { FormularioMesaComponent } from '../formulario-mesa/formulario-mesa.component';

@Component({
  selector: 'app-mesa-detalles',
  standalone: true,
  imports: [CommonModule, RouterModule , NgZorroModule, SharedModule],
  templateUrl: './mesa-detalles.component.html',
  styles: ``
})
export default class MesaDetallesComponent {
  title: string = `Mesas`;

  mesaId!: number
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

  integranteUbigeos = signal<MesaUbigeoResponse[]>([])
  integranteSectores = signal<MesaUbigeoResponse[]>([])
  mesasSesion = signal<MesaDetalleResponse[]>([])
  mesasAm = signal<MesaDetalleResponse[]>([])

  loadingUbigeos: boolean = false
  loadingSectores: boolean = false
  loadingDataSesion: boolean = false
  loadingDataAm: boolean = false

  paginationUbigeos: Pagination = {
    columnSort: 'fechaRegistro',
    typeSort: 'DESC',
    pageSize: 5,
    currentPage: 1,
    total: 0
  }

  paginationSectores: Pagination = this.paginationUbigeos

  paginationSesion: Pagination = {
    columnSort: 'fechaRegistro',
    typeSort: 'DESC',
    pageSize: 5,
    currentPage: 1,
    total: 0
  }

  paginationAm: Pagination = {
    columnSort: 'fechaRegistro',
    typeSort: 'DESC',
    pageSize: 5,
    currentPage: 1,
    total: 0
  }


  private mesaServices = inject(MesasService)
  private mesaDetalleServices = inject(MesaDetallesService)
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private modal = inject(NzModalService);
  private mesaUbigeosService = inject(MesaUbigeosService)

  ngOnInit(): void {
    this.verificarMesa()
    this.obtenerUbigeosService(0)
    this.obtenerUbigeosService(1)
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

  obtenerUbigeosService(esSector: number){
    esSector == 1 ? this.loadingSectores = true : this.loadingUbigeos = true
    this.paginationUbigeos.esSector = esSector.toString()
    this.mesaUbigeosService.ListarMesaUbigeos(this.mesaId, this.paginationUbigeos)
      .subscribe( resp => {        
        esSector == 1 ? this.loadingSectores = false : this.loadingUbigeos = false
        esSector == 1 ? this.integranteSectores.set(resp.data) : this.integranteUbigeos.set(resp.data)
        esSector == 1 ? this.paginationSectores.total = resp.info?.total : this.paginationUbigeos.total = resp.info!.total
      })
  }

  obtenerDetalleMesa(tipo: number){     
    tipo == 1 ? this.loadingDataAm = true : this.loadingDataSesion = true
    const pagination = tipo == 1 ? this.paginationAm : this.paginationSesion
    this.mesaDetalleServices.ListarMesaDetalle(this.mesaId, tipo, pagination)
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

            const fechaCreacion = getDateFormat(formMesa.get('fechaCreacion')?.value, 'month')
            const fechaVigencia = getDateFormat(formMesa.get('fechaVigencia')?.value, 'month')
            const usuarioId =localStorage.getItem('codigoUsuario')

            const bodyMesa: MesaResponse = {...formMesa.getRawValue() , fechaCreacion, fechaVigencia, usuarioId}
            console.log(bodyMesa);
                                    
          }
        }
      ]
    })
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
            const fechaCreacion = getDateFormat(formMesaDetalle.get('fechaCreacion')?.value, 'month')
            const mesaDetalle = {
              ...formMesaDetalle.value,
              fechaCreacion,
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
      nzContent: `¿Está seguro de que desea eliminar el archivo ${detalle.nombre}?`,
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
