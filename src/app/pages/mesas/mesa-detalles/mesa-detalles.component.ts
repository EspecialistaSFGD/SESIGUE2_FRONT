import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MesaDetalleResponse, MesaResponse, MesaUbigeoResponse, Pagination } from '@core/interfaces';
import { DescargarService, MesaDetallesService, MesasService, MesaUbigeosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { SharedModule } from '@shared/shared.module';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormularioMesaDetalleComponent } from './formulario-mesa-detalle/formulario-mesa-detalle.component';
import { generateBase64ToArrayBuffer, getDateFormat } from '@core/helpers';
import saveAs from 'file-saver';

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
    sectorId: '',
    secretariaTecnicaId: '',
    fechaCreacion: '',
    fechaVigencia: '',
    resolucion: '',
    estadoRegistroNombre: '',
    estadoRegistro: ''
  })

  ubigeos = signal<MesaUbigeoResponse[]>([])
  mesasSesion = signal<MesaDetalleResponse[]>([])
  mesasAm = signal<MesaDetalleResponse[]>([])

  loadingUbigeos: boolean = false
  loadingDataSesion: boolean = false
  loadingDataAm: boolean = false

  paginationUbigeos: Pagination = {
    columnSort: 'fechaRegistro',
    typeSort: 'DESC',
    pageSize: 5,
    currentPage: 1,
    total: 0
  }

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
  private descargarService = inject(DescargarService)
  private mesaUbigeosService = inject(MesaUbigeosService)

  ngOnInit(): void {
    this.verificarMesa()
    this.obtenerUbigeosService()
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

  obtenerUbigeosService(){
    this.loadingUbigeos = true
    this.mesaUbigeosService.ListarMesaUbigeos(this.mesaId, this.paginationUbigeos)
      .subscribe( resp => {
        this.loadingUbigeos = false
        this.ubigeos.set(resp.data)
        this.paginationUbigeos.total = resp.info!.total
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
