import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventoResponse, GrupoResponse, Pagination } from '@core/interfaces';
import { GrupoService } from '@core/services';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';

@Component({
  selector: 'app-evento-grupos',
  standalone: true,
  imports: [CommonModule, FormsModule, PrimeNgModule],
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

  ngOnInit(): void {
    this.obtenerGruposEvento()
    this.obtenerGruposEvento(true)
  }

  obtenerGruposEvento(subTipo: boolean = false){
    subTipo ? this.pagination.subTipo = this.evento.subTipoId?.toString() : delete this.pagination.subTipo
    this.loading = true

    this.grupoService.listarGrupos(this.pagination)
      .subscribe( resp => {
        if(subTipo){
          this.gobiernoRegionalLocal.set(resp.data.filter(grupo => grupo.subTipo === Number(this.evento.subTipoId)))
        } else {
          this.gobiernoNacional.set(resp.data.filter(grupo => grupo.abreviatura === 'GN'))
          this.pcm.set(resp.data.filter(grupo => !grupo.abreviatura))
        }
      })
  }

  changeEventoGrupo(grupo: GrupoResponse){
    this.actualizarGruposServices(grupo)
  }

  actualizarGruposServices(grupo: GrupoResponse){
    this.grupoService.actualizarGrupo(grupo)
      .subscribe( resp => {
        console.log(resp.data);        
      })
  }
}