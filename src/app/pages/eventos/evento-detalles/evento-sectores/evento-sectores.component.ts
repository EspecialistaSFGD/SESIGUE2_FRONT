import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DepartamentoEventoDetalle, EntidadResponse, EventoResponse, EventoSectorDetalleResponse, EventoSectorResponse, EventoSectorSwitchList, Pagination, SectorResponse, SubTipoEntidad } from '@core/interfaces';
import { EntidadesService, EventoSectorDetallesService, EventoSectoresService, SectoresService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { BotonComponent } from '@shared/boton/boton/boton.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { MessageService } from 'primeng/api';
import { FormularioEventoSectoresComponent } from './formulario-evento-sectores/formulario-evento-sectores.component';

@Component({
  selector: 'app-evento-sectores',
  standalone: true,
  imports: [CommonModule, FormsModule, NgZorroModule, BotonComponent, PrimeNgModule],
  providers: [MessageService],
  templateUrl: './evento-sectores.component.html',
  styles: ``
})
export class EventoSectoresComponent {
  @Input() evento: EventoResponse = {} as EventoResponse
  @Input() esSsfgd: boolean = false

  usuarioId: number = 0
  subTipo = signal<SubTipoEntidad>({} as SubTipoEntidad)

  loading: boolean = false
  pagination: Pagination = {
    columnSort: 'eventoSectorId',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }
  
  eventoSectores = signal<EventoSectorSwitchList[]>([])
  entidadesEventosDetalles = signal<DepartamentoEventoDetalle[]>([])
  entidades = signal<EntidadResponse[]>([])
  
  private eventoSectorService = inject(EventoSectoresService)
  private eventoSectorDetalleService = inject(EventoSectorDetallesService)
  private sectorService = inject(SectoresService)
  private entidadService = inject(EntidadesService)
  private messageService = inject(MessageService)  
  private modal = inject(NzModalService)
  private breakpoint = inject(BreakpointObserver)

  ngOnInit(): void {
    this.listarEntidadTipoEventoSector()   
    this.getPermission()
    this.pagination.eventoId = this.evento.eventoId
  }

  getPermission(){
    this.usuarioId = Number(localStorage.getItem('codigoUsuario')) ?? 0
  }

  listarEntidadTipoEventoSector(){
    const subTiposEntidad: SubTipoEntidad[] = [
      { subTipo: 'REGION', subTipoSlug: 'R', cantidad: 30, },
      { subTipo: 'PROVINCIAL', subTipoSlug: 'P', cantidad: 200, },
      { subTipo: 'DISTRITAL', subTipoSlug: 'D', cantidad: 1700, },
    ]

    const subTipo = subTiposEntidad.find( st => st.subTipo.toLowerCase() === this.evento.subTipo.toLowerCase() )!
    this.subTipo.set(subTipo)

    const paginationEntidad: Pagination = { columnSort: 'entidadId', typeSort: 'ASC', pageSize: 10, currentPage: 1 }
    switch (subTipo.subTipoSlug.toUpperCase()) {
      case 'R': paginationEntidad.pageSize = 30; paginationEntidad.subTipos = ['R']; break;
      case 'P': paginationEntidad.pageSize = 250; paginationEntidad.subTipos = ['P']; break;
      case 'D': paginationEntidad.pageSize = 2000; paginationEntidad.subTipos = ['P','D']; break;
    }

    this.entidadService.listarEntidades(paginationEntidad).subscribe( resp => this.entidades.set(resp.data))
  }

  obtenerEventoSectoresService(){
    this.eventoSectorService.listarEventoSectores(this.pagination)
      .subscribe( resp => {        
        const sectoresSwitchList: EventoSectorSwitchList[] = resp.data.map( eventoSector => ({ ...eventoSector, registraPedido: eventoSector.cantidadPedidos != 0 }))
        this.eventoSectores.set(sectoresSwitchList)
        this.pagination.total = resp.info?.total        
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const sort = params.sort.find(item => item.value == 'ascend')
    this.pagination.columnSort = sort ? sort.key : 'eventoSectorId'
    
    this.pagination.pageSize = params.pageSize
    this.pagination.currentPage = params.pageIndex
    this.obtenerEventoSectoresService()
  }

  generarSectores(){
    const title = 'Generar Sectores'
    const widthModal = (this.breakpoint.isMatched('(max-width: 767px)')) ? '90%' : '50%';
    this.modal.create<FormularioEventoSectoresComponent>({
      nzTitle: title,
      nzWidth: widthModal,
      nzMaskClosable: false,
      nzContent: FormularioEventoSectoresComponent,
      nzData: {},
      nzFooter: [
        {
          label: 'Cancelar',
          type: 'default',
          onClick: () => this.modal.closeAll(),
        },
        {
          label: title,
          type: 'primary',
          onClick: (componentResponse) => {
            const formEventoSectores = componentResponse!.formEventoSectores;
                       
            if (formEventoSectores.invalid) {
              const invalidFields = Object.keys(formEventoSectores.controls).filter(field => formEventoSectores.controls[field].invalid);
              console.error('Invalid fields:', invalidFields);
              return formEventoSectores.markAllAsTouched();
            }

            const departamentosDetalles = formEventoSectores.get('departamentos')?.value

            const seleccionados: DepartamentoEventoDetalle[] = departamentosDetalles.filter((item:DepartamentoEventoDetalle) => item.seleccionado)
            this.entidadesEventosDetalles.set(seleccionados)
            const ubigeos = seleccionados.map(item => item.ubigeo.substring(0,2))
            const entidadesEventosDetalleFiltrado = this.entidades().filter( item => ubigeos.includes(item.ubigeo.substring(0,2)) )
            this.entidades.set(entidadesEventosDetalleFiltrado)

            this.ListarSectoresService('SECTOR')
            // this.ListarSectoresService('SECTOR_DETALLES') //optimizar servicio al guardar los sectores evento detalles, no todos se registran, cae el servicio al guardar

            setTimeout(() => {
              this.obtenerEventoSectoresService()
              this.modal.closeAll()
            }, 3000);

          }
        }
      ]
    })
  }

  ListarSectoresService(tipo:string){
    const pagination: Pagination = { columnSort: 'grupoID', typeSort: 'ASC', pageSize: 50, currentPage: 1 }
    this.sectorService.listarSectores(pagination)
      .subscribe( resp => {
        switch (tipo.toUpperCase()) {
          case 'SECTOR':
            for(let sector of resp.data){
              const eventoSector: EventoSectorResponse = {eventoId: this.evento.eventoId!, sectorId: sector.grupoID!, cantidadPedidos: 0, registraAtencion: false}
              this.crearEventoSectoresService(eventoSector);
            }
          break;
          case 'SECTOR_DETALLES':
            for(let sector of resp.data){
              this.generarSectorEventoDetalles(sector);
            }
          break;
        }
      })
  }

  crearEventoSectoresService(eventoSector: EventoSectorResponse){
    this.eventoSectorService.registrarEventoSector(eventoSector).subscribe( resp => {})
  }

   generarSectorEventoDetalles(sector: SectorResponse){
    const cantidadPedidos = this.evento.maximoPedidos ? this.evento.maximoPedidos : 0
    if(this.subTipo().subTipoSlug == 'R'){
      for(let entidadEvento of this.entidadesEventosDetalles()){
        const eventoDetalle:EventoSectorDetalleResponse = { eventoId: this.evento.eventoId!, entidadId: entidadEvento.entidadId!, sectorId: sector.grupoID, cantidadPedidos, usuarioId: this.usuarioId }
        this.crearEventoSectorDetalleService(eventoDetalle)
      }
    } else {
      for(let entidad of this.entidades()){
        const eventoDetalle:EventoSectorDetalleResponse = { eventoId: this.evento.eventoId!, entidadId: entidad.entidadId!, sectorId: sector.grupoID, cantidadPedidos, usuarioId: this.usuarioId }
        this.crearEventoSectorDetalleService(eventoDetalle)
      }
    }
  }

  crearEventoSectorDetalleService(eventoDetalle:EventoSectorDetalleResponse){
    this.eventoSectorDetalleService.RegistrarEventoDetalleSector(eventoDetalle).subscribe( resp => {})
  }

  showCantidadSectores(eventoSector: EventoSectorSwitchList, pedido: boolean = true){                                                               
    const cantidadPedidos = pedido ? eventoSector.registraPedido ? 5 : 0 : eventoSector.cantidadPedidos

    this.eventoSectores.update(lista =>
      lista.map(item => item.eventoSectorId === eventoSector.eventoSectorId
        ? { ...item, cantidadPedidos }
        : item )
    )

    const eventoSectorUpdate: EventoSectorResponse = {...eventoSector, cantidadPedidos}
    this.actualizarEventoSectoresService(eventoSectorUpdate)
  }

  setCantidadSectores(eventoSector: EventoSectorResponse){
    this.actualizarEventoSectoresService(eventoSector)
  }

  actualizarEventoSectoresService(eventoSector: EventoSectorResponse){
    eventoSector.registraAtencion  = eventoSector.registraAtencion ?? false
    this.eventoSectorService.actualizarEventoSector(eventoSector)
      .subscribe( resp => {
        if(resp.success){
          this.messageService.add({ severity: 'success', summary: 'Sector del evento actualizado', detail: resp.message });
          this.obtenerEventoSectoresService()
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: resp.message });
        }
      })
  }
}
