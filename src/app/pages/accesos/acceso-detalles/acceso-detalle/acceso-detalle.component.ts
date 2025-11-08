import { CommonModule } from '@angular/common';
import { Component, inject, Input, SimpleChanges } from '@angular/core';
import { AccesoResponse, PerfilResponse } from '@core/interfaces';
import { PerfilesService } from '@core/services';

@Component({
  selector: 'app-acceso-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './acceso-detalle.component.html',
  styles: ``
})
export class AccesoDetalleComponent {
  @Input() acceso: AccesoResponse = {} as AccesoResponse
  perfil: PerfilResponse = {} as PerfilResponse

  private perfilService = inject(PerfilesService)

  ngOnChanges(changes: SimpleChanges): void {
    this.obtenerPerfil()
  }

  obtenerPerfil(){    
    this.perfilService.obtenerPerfil(this.acceso.perfilId).subscribe(resp => this.perfil = resp.data)
  }
}
