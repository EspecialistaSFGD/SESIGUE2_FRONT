import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MesaDocumentoTipoEnum } from '@core/enums';
import { convertEnumToObject, getDateFormat } from '@core/helpers';
import { ItemEnum, MesaDocumentoResponse, MesaResponse, MesaUbigeoResponse, Pagination } from '@core/interfaces';
import { MesaDocumentosService, MesasService, MesaUbigeosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { SharedModule } from '@shared/shared.module';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormularioMesaComponent } from '../formulario-mesa/formulario-mesa.component';
import { FormularioMesaDocumentoComponent } from './formulario-mesa-documento/formulario-mesa-documento.component';
import { IntegrantesMesaComponent } from "./integrantes-mesa/integrantes-mesa.component";

@Component({
  selector: 'app-mesa-detalles',
  standalone: true,
  imports: [CommonModule, RouterModule, NgZorroModule, SharedModule, IntegrantesMesaComponent],
  templateUrl: './mesa-detalles.component.html',
  styles: ``
})
export default class MesaDetallesComponent {
  title: string = `Mesas`;

  tipos: ItemEnum[] = convertEnumToObject(MesaDocumentoTipoEnum)
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

  mesasSesion = signal<MesaDocumentoResponse[]>([])
  mesasAm = signal<MesaDocumentoResponse[]>([])
  documentosResolucion = signal<MesaDocumentoResponse[]>([])

  loadingDataSesion: boolean = false
  loadingDataAm: boolean = false

  paginationSesion: Pagination = {
    columnSort: 'documentoId',
    typeSort: 'DESC',
    pageSize: 5,
    currentPage: 1,
    total: 0
  }

  paginationAm: Pagination = {
    columnSort: 'documentoId',
    typeSort: 'DESC',
    pageSize: 5,
    currentPage: 1,
    total: 0
  }

  paginationResolucion: Pagination = {
    columnSort: 'documentoId',
    typeSort: 'DESC',
    pageSize: 5,
    currentPage: 1,
    total: 0
  }


  private mesaServices = inject(MesasService)
  private mesaDetalleServices = inject(MesaDocumentosService)
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private modal = inject(NzModalService);

  ngOnInit(): void {
    this.verificarMesa()
    this.obtenerDetalleMesa(0)
    this.obtenerDetalleMesa(1)
    this.obtenerDetalleMesa(2)
  }

  verificarMesa(){
    const mesaId = this.route.snapshot.params['id'];
    const mesaIdNumber = Number(mesaId);
    if (isNaN(mesaIdNumber)) {
      this.router.navigate(['/mesas']);
      return;
    }

    this.mesaId = mesaIdNumber
    this.obtenerMesaService()
  }

  obtenerMesaService(){    
    this.mesaServices.obtenerMesa(this.mesaId.toString())
      .subscribe( resp => {
        if(resp.success){
          this.mesa.set(resp.data)
        } else {
          this.router.navigate(['/mesas']);
        }
      })
  }

  obtenerDetalleMesa(tipo: number){
    const documento = this.tipos.find( item => Number(item.text) == tipo )!
    this.loadingDataSesion = documento.text === MesaDocumentoTipoEnum.SESION ?  true : false
    this.loadingDataAm = documento.text === MesaDocumentoTipoEnum.AM ?  true : false

    let pagination = this.paginationSesion
    if(documento.text == MesaDocumentoTipoEnum.AM ){
      pagination = this.paginationAm
    } else if(documento.text == MesaDocumentoTipoEnum.RESOLUCION){
      pagination = this.paginationResolucion
    }

    this.mesaDetalleServices.ListarMesaDetalle(this.mesaId, tipo, pagination)
      .subscribe( resp => {
        switch (documento.text) {
          case MesaDocumentoTipoEnum.SESION: this.mesasSesion.set(resp.data); this.loadingDataSesion = false; this.paginationSesion.total = resp.info!.total; break;
          case MesaDocumentoTipoEnum.AM: this.mesasAm.set(resp.data); this.loadingDataAm = false; this.paginationAm.total; break;
          case MesaDocumentoTipoEnum.RESOLUCION: this.documentosResolucion.set(resp.data); this.paginationResolucion.total; break;
        }
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
        mesa: this.mesa(),
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

            const mesaId = this.mesa().mesaId
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

  actualizarMesaService(mesa: MesaResponse){
    this.mesaServices.actualizarMesa(mesa)
      .subscribe( resp => {
        if(resp.success == true){
          this.obtenerMesaService()
          this.modal.closeAll();
        }
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

  deleteMesaDetalle(detalle: MesaDocumentoResponse, tipo: number) {
    const title = tipo == 1 ? 'AM' : 'SESIÓN'
    this.modal.confirm({
      nzTitle: `Eliminar ${title}`,
      nzContent: `¿Está seguro de que desea eliminar el archivo ${detalle.nombre}?`,
      nzOkText: 'Eliminar',
      nzOkDanger: true,
      nzOnOk: () => {
        this.mesaDetalleServices.eliminarMesaDetalle(detalle.documentoId!)
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
