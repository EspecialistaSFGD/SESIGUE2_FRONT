import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { EventoDiaResponse, EventoResponse, Pagination } from '@core/interfaces';
import { EventoDiasService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { BotonComponent } from '@shared/boton/boton/boton.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { MessageService } from 'primeng/api';
import { FormularioEventoDiasComponent } from './formulario-evento-dias/formulario-evento-dias.component';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-evento-dias',
  standalone: true,
  imports: [CommonModule, NgZorroModule, BotonComponent, PrimeNgModule],
  providers: [MessageService],
  templateUrl: './evento-dias.component.html',
  styles: ``
})
export class EventoDiasComponent {
  @Input() evento!: EventoResponse;
  
  loading: boolean = false
  eventoDias = signal<EventoDiaResponse[]>([]);

  pagination: Pagination = {
    columnSort: 'diaEventoId',
    typeSort: 'asc',
    currentPage: 1,
    pageSize: 10
  }

  private eventoDiaService = inject(EventoDiasService)
  private modal = inject(NzModalService)
  private breakpoint = inject(BreakpointObserver)
  private messageService = inject(MessageService)

  ngOnInit(): void {
    this.obtenerDiasEvento()
  }

  obtenerDiasEvento(){
    this.loading = true
    this.pagination.eventoId = this.evento.eventoId?.toString()
    this.eventoDiaService.ListarEventoDias(this.pagination)
      .subscribe( resp => {
        this.loading = false
        this.eventoDias.set(resp.data);
        this.pagination.total = resp.info?.total
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    
  }

  actualizarDiaEvento(diaEvento: EventoDiaResponse){
    this.modalFormActualizarDiaEvento(diaEvento)
  }

  modalFormActualizarDiaEvento(diaEvento: EventoDiaResponse){
    const widthModal = (this.breakpoint.isMatched('(max-width: 767px)')) ? '90%' : '50%';
    this.modal.create<FormularioEventoDiasComponent>({
      nzTitle: `Actualizar el día del evento: ${diaEvento.fecha}`,
      nzWidth: widthModal,
      nzMaskClosable: false,
      nzContent: FormularioEventoDiasComponent,
      nzData: diaEvento,
      nzFooter: [
        {
          label: 'Cancelar',
          type: 'default',
          onClick: () => this.modal.closeAll(),
        },
        {
          label: 'Actualizar',
          type: 'primary',
          onClick: (componentResponse) => {

            const formDiaEvento = componentResponse!.formDiaEvento

            if (formDiaEvento.invalid) {
              const invalidFields = Object.keys(formDiaEvento.controls).filter(field => formDiaEvento.controls[field].invalid);
              console.error('Invalid fields:', invalidFields);
              return formDiaEvento.markAllAsTouched();
            }

            const diaEventoBody: EventoDiaResponse = {

              ...formDiaEvento.value,
              eventoId: this.evento.eventoId,
              eventoDiaId: diaEvento.eventoDiaId,
              fecha: diaEvento.fecha
            }

           this.actualizarEventoDiaService(diaEventoBody)
          }
        }
      ]
    });
  }

  actualizarEventoDiaService(diaEvento: EventoDiaResponse){
    this.eventoDiaService.actualizarEventoDia(diaEvento)
      .subscribe( resp => {        
        if(resp.success){
          this.messageService.add({severity:'success', summary: 'Éxito', detail: 'Día del evento actualizado correctamente.'});
          this.obtenerDiasEvento()
          this.modal.closeAll()
        } else {
          this.messageService.add({severity:'error', summary: 'Error', detail: resp.message || 'Error al actualizar el día del evento.'});
        }
      })
  }

}
