import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventoResponse, EventoSectorResponse, EventoSectorSwitchList, Pagination, SubTipoEntidad } from '@core/interfaces';
import { EntidadesService, EventoSectoresService, SectoresService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { BotonComponent } from '@shared/boton/boton/boton.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { MessageService } from 'primeng/api';
import { FormularioEventoSectoresComponent } from './formulario-evento-sectores/formulario-evento-sectores.component';
import { EventoSectorDetalleResponse } from '@core/interfaces/evento-sector-detalle.interface';

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

  loading: boolean = false
  pagination: Pagination = {
    columnSort: 'eventoSectorId',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }
  
  eventoSectores = signal<EventoSectorSwitchList[]>([])
  
  private eventoSectorService = inject(EventoSectoresService)
  private sectorService = inject(SectoresService)
  private entidadService = inject(EntidadesService)
  private messageService = inject(MessageService)  
  private modal = inject(NzModalService)
  private breakpoint = inject(BreakpointObserver)

  ngOnInit(): void {
    // this.obtenerDetallesSector()    
    this.pagination.eventoId = this.evento.eventoId
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

            this.ListarSectoresService()

            setTimeout(() => {
              this.obtenerEventoSectoresService()
              this.modal.closeAll()
            }, 3000);

          }
        }
      ]
    })
  }

  ListarSectoresService(){
    const pagination: Pagination = { columnSort: 'grupoID', typeSort: 'ASC', pageSize: 50, currentPage: 1 }
    this.sectorService.listarSectores(pagination).subscribe( resp => {
      resp.data.forEach( sector => {
        const eventoSector: EventoSectorResponse = {eventoId: this.evento.eventoId!, sectorId: sector.grupoID!, cantidadPedidos: 0, registraAtencion: false}
        this.crearEventoSectoresService(eventoSector);
      })  
    })
  }

  crearEventoSectoresService(eventoSector: EventoSectorResponse){
    this.eventoSectorService.registrarEventoSector(eventoSector)
      .subscribe( resp => {
        if(resp.success){
          // this.messageService.add({ severity: 'success', summary: 'Sectores del evento agregado', detail: resp.message });
          // this.obtenerEventoSectoresService()
          // this.modal.closeAll()
        } else {
          // this.messageService.add({ severity: 'error', summary: 'Error', detail: resp.message });
        }
      })
  }

  obtenerDetallesSector(){
    const subTiposEntidad: SubTipoEntidad[] = [
      { subTipo: 'REGION', subTipoSlug: 'R', cantidad: 30, },
      { subTipo: 'PROVINCIAL', subTipoSlug: 'P', cantidad: 200, },
      { subTipo: 'DISTRITAL', subTipoSlug: 'D', cantidad: 1700, },
    ];

    const subTipo = subTiposEntidad.find( st => st.subTipo.toLowerCase() === this.evento.subTipo.toLowerCase() )
    
    if(subTipo?.subTipoSlug === 'D'){
      const subTipoDistrital: SubTipoEntidad = subTiposEntidad.find( st => st.subTipoSlug === 'P' )!
      this.listarEntidadesParaEventoSectores(subTipoDistrital)
    }

    this.listarEntidadesParaEventoSectores(subTipo!)
  }
  
  listarEntidadesParaEventoSectores(subTipo: SubTipoEntidad){
    const pagination: Pagination = { columnSort: 'entidadId', typeSort: 'ASC', pageSize: subTipo!.cantidad, currentPage: 1 }
    this.entidadService.listarEntidades(pagination, [subTipo!.subTipoSlug])
      .subscribe( resp => {
        for(let entidad of resp.data){
          this.ListarSectoresDetallesService(entidad.entidadId!)
        }
      } )
  }

  ListarSectoresDetallesService(entidadId: string){
    const eventoId = this.evento.eventoId!
    const pagination: Pagination = { columnSort: 'grupoID', typeSort: 'ASC', pageSize: 50, currentPage: 1 }
    this.sectorService.listarSectores(pagination).subscribe( resp => {
      resp.data.forEach( sector => {
        const eventoSectorDetalle:EventoSectorDetalleResponse = { eventoId, entidadUbigeoId: entidadId, entidadSectorId: sector.grupoID!, cantidadPedidos: '0' }
      })
    })    
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
