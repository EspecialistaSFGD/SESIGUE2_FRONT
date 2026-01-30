import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventoResponse, GrupoResponse, Pagination } from '@core/interfaces';
import { GrupoService } from '@core/services';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-evento-grupos',
  standalone: true,
  imports: [CommonModule, FormsModule, PrimeNgModule],
  providers: [MessageService],
  templateUrl: './evento-grupos.component.html',
  styles: ``
})
export class EventoGruposComponent {
  @Input() evento!: EventoResponse

  gobiernoNacional = signal<GrupoResponse[]>([])
  pcm = signal<GrupoResponse[]>([])
  gobiernoRegionalLocal = signal<GrupoResponse[]>([])
    
  loading: boolean = false
  pagination: Pagination = {
    columnSort: 'grupoID',
    typeSort: 'ASC',
    currentPage: 1,
    pageSize: 20,
    tipo: '1'
  }

  private grupoService = inject(GrupoService)
  private messageService = inject(MessageService)

  ngOnInit(): void {
    this.obtenerGruposEvento('GN')
    this.obtenerGruposEvento('GR')
    this.obtenerGruposEvento('PCM')
  }

  obtenerGruposEvento(tipo:string){
    switch (tipo) {
      case 'GN': this.pagination.subTipo = '2'; break
      case 'GR': this.pagination.subTipo = this.evento.subTipoId?.toString(); break
      case 'PCM': this.pagination.subTipo = '8'; break
    }

    this.loading = true
    this.grupoService.listarGrupos(this.pagination)
      .subscribe( resp => {
        this.loading = false
        switch (tipo) {
          case 'GN': this.gobiernoNacional.set(resp.data); break
          case 'GR': this.gobiernoRegionalLocal.set(resp.data); break
          case 'PCM': this.pcm.set(resp.data); break
        }
      })
  }

  changeEventoGrupo(grupo: GrupoResponse){
    this.actualizarGruposServices(grupo)
  }

  actualizarGruposServices(grupo: GrupoResponse){
    this.grupoService.actualizarGrupo(grupo)
      .subscribe( resp => {
        if(resp.success){
          this.messageService.add({ severity: 'success', summary: `El grupo ${grupo.nombre} se ha actualizado`, detail: resp.message });
        } else {
          this.messageService.add({ severity: 'error', summary: `Error al actualizar el grupo ${grupo.nombre}`, detail: resp.message });
        }
      })
  }
}