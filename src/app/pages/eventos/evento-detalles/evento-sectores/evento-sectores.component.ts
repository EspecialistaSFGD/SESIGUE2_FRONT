import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { EventoResponse, EventoSectorResponse, Pagination } from '@core/interfaces';
import { EventoSectoresService, SectoresService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { BotonComponent } from '@shared/boton/boton/boton.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { FormularioEventoSectoresComponent } from './formulario-evento-sectores/formulario-evento-sectores.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MessageService } from 'primeng/api';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';

@Component({
  selector: 'app-evento-sectores',
  standalone: true,
  imports: [CommonModule, NgZorroModule, BotonComponent, PrimeNgModule],
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
  
  eventoSectores = signal<EventoSectorResponse[]>([])
  
  private eventoSectorService = inject(EventoSectoresService)
  private sectorService = inject(SectoresService)
  private messageService = inject(MessageService)  
  private modal = inject(NzModalService)
  private breakpoint = inject(BreakpointObserver)

  ngOnInit(): void {
    this.pagination.eventoId = this.evento.eventoId
  }

  obtenerEventoSectoresService(){
    this.eventoSectorService.listarEventoSectores(this.pagination)
      .subscribe( resp => {        
        this.eventoSectores.set(resp.data)
        this.eventoSectores.set(resp.data)
        this.pagination.total = resp.info?.total        
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
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
          }
        }
      ]
    })
  }

  ListarSectoresService(){
    const pagination: Pagination = { columnSort: 'grupoID', typeSort: 'ASC', pageSize: 50, currentPage: 1 }
    this.sectorService.listarSectores(pagination).subscribe( resp => {
      resp.data.forEach( sector => {
        const eventoSector: EventoSectorResponse = {eventoId: this.evento.eventoId!, sectorId: sector.grupoID!, cantidadPedidos: 0, cantidadAtenciones: 0}
        this.crearEventoSectoresService(eventoSector);
      })  
    })
  }

  crearEventoSectoresService(eventoSector: EventoSectorResponse){
    this.eventoSectorService.registrarEventoSector(eventoSector)
      .subscribe( resp => {
        if(resp.success){
          this.messageService.add({ severity: 'success', summary: 'Sectores del evento agregado', detail: resp.message });
          this.obtenerEventoSectoresService()
          this.modal.closeAll()
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: resp.message });
        }
      })
  }

  actualizarEventoSector(EventoSector: EventoSectorResponse){

  }
}
