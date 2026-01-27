import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { EventoResponse, GrupoResponse, Pagination } from '@core/interfaces';
import { GrupoService } from '@core/services';

@Component({
  selector: 'app-evento-grupos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evento-grupos.component.html',
  styles: ``
})
export class EventoGruposComponent {
  @Input() evento!: EventoResponse

  gobiernoNacional = signal<GrupoResponse[]>([])
  pcm = signal<GrupoResponse[]>([])
    
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
  }

  obtenerGruposEvento(){
    this.grupoService.listarGrupos(this.pagination)
      .subscribe( resp => {
        this.gobiernoNacional.set(resp.data.filter(grupo => grupo.abreviatura === 'GN'))
        this.pcm.set(resp.data.filter(grupo => !grupo.abreviatura))
      })
  }
}
