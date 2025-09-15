import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, input, Input, Output, output, signal } from '@angular/core';
import { MesaDocumentoTipoEnum } from '@core/enums';
import { convertEnumToObject, getDateFormat, obtenerPermisosBotones } from '@core/helpers';
import { ButtonsActions, ItemEnum, MesaDocumentoResponse, MesaResponse, Pagination, UsuarioNavigation } from '@core/interfaces';
import { MesaDocumentosService, MesasService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { SharedModule } from '@shared/shared.module';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormularioMesaComponent } from '../../formulario-mesa/formulario-mesa.component';
import { FormularioMesaDocumentoComponent } from '../documentos-mesa/formulario-mesa-documento/formulario-mesa-documento.component';
import { AuthService } from '@libs/services/auth/auth.service';

@Component({
  selector: 'app-mesa-detalle',
  standalone: true,
  imports: [CommonModule, SharedModule, NgZorroModule],
  templateUrl: './mesa-detalle.component.html',
  styles: ``
})
export class MesaDetalleComponent {
  @Input() mesa!: MesaResponse
  @Input() action: boolean = true
  @Output() updated = new EventEmitter<boolean>()

  permisosPCM: boolean = false
  perfilAuth: number = 0

  mesasActions: ButtonsActions = {}
  mesasDocumentosActions: ButtonsActions = {}

  tipos: ItemEnum[] = convertEnumToObject(MesaDocumentoTipoEnum)

  paginationResolucion: Pagination = {
    columnSort: 'documentoId',
    typeSort: 'DESC',
    pageSize: 5,
    currentPage: 1,
    total: 0
  }

  documentosResolucion = signal<MesaDocumentoResponse[]>([])
    
  private mesaServices = inject(MesasService)
  private mesaDetalleServices = inject(MesaDocumentosService)
  private authStore = inject(AuthService)

  private modal = inject(NzModalService);

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.perfilAuth = this.authStore.usuarioAuth().codigoPerfil!
    this.permisosPCM = this.setPermisosPCM()
    this.obtenerMesaDocumentos()
    this.getPermissions()
  }
  
  setPermisosPCM(){
    // const profilePCM = [11,12,23]
    const permisosStorage = localStorage.getItem('permisosPcm') ?? ''
    return JSON.parse(permisosStorage) ?? false
  }

  getPermissions() {
    // const navigation:UsuarioNavigation[] = this.authStore.navigationAuth()!
    const navigation:UsuarioNavigation[] = JSON.parse(localStorage.getItem('menus') || '')    
    const menu = navigation.find((nav) => nav.descripcionItem.toLowerCase() == 'mesas')
    this.mesasActions = obtenerPermisosBotones(menu!.botones!)

    const menuLevel = menu!.children!.find(nav => nav.descripcionItem?.toLowerCase() == 'mesa documentos')
    this.mesasDocumentosActions = obtenerPermisosBotones(menuLevel!.botones!)
  }

  obtenerMesaDocumentos(){
    const tipo = 2
    const pagination = this.paginationResolucion
    const mesaId = Number(this.mesa.mesaId!)

    this.mesaDetalleServices.ListarMesaDetalle(mesaId, tipo, pagination).subscribe( resp => this.documentosResolucion.set(resp.data))
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

          const mesaId = this.mesa.mesaId
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
        this.modal.closeAll();
        this.updated.emit(true)
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
        create: true,
        mesa: this.mesa
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
              mesaId: this.mesa.mesaId
            }

            this.mesaDetalleServices.registarMesaDetalle(mesaDetalle)
              .subscribe( resp => {
                if(resp.success){
                  this.modal.closeAll()
                  this.updated.emit(true)
                  this.obtenerMesaDocumentos()
                }
              })
          }
        }
      ],
    });
  }
}
