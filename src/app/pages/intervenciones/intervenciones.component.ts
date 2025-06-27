import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Pagination } from '@core/interfaces';
import { IntervencionPanel } from '@core/interfaces/intervencion.interface';
import { IntervencionService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { IntervencionPanelAptosComponent } from './intervencionPanel/intervencion-panel-aptos/intervencion-panel-aptos.component';
import { IntervencionPanelEstadoComponent } from './intervencionPanel/intervencion-panel-estado/intervencion-panel-estado.component';
import { IntervencionPanelInfoComponent } from './intervencionPanel/intervencion-panel-info/intervencion-panel-info.component';
import { IntervencionPanelMapaComponent } from './intervencionPanel/intervencion-panel-mapa/intervencion-panel-mapa.component';
import { IntervencionPanelNivelGobiernoComponent } from './intervencionPanel/intervencion-panel-nivel-gobierno/intervencion-panel-nivel-gobierno.component';
import { IntervencionPanelSectorComponent } from './intervencionPanel/intervencion-panel-sector/intervencion-panel-sector.component';
import { IntervencionPanelUbigeoComponent } from './intervencionPanel/intervencion-panel-ubigeo/intervencion-panel-ubigeo.component';
import { IntervencionPanelFiltrosComponent } from "./intervencionPanel/intervencion-panel-filtros/intervencion-panel-filtros.component";

@Component({
  selector: 'app-intervenciones',
  standalone: true,
  imports: [CommonModule, NgZorroModule, IntervencionPanelInfoComponent, IntervencionPanelMapaComponent, IntervencionPanelSectorComponent, IntervencionPanelNivelGobiernoComponent, IntervencionPanelUbigeoComponent, IntervencionPanelEstadoComponent, IntervencionPanelAptosComponent, IntervencionPanelFiltrosComponent],
  templateUrl: './intervenciones.component.html',
  styles: ``
})
export default class IntervencionesComponent {
  title: string = `Intervenciones`;

  pagination: Pagination = {}

  intervenciones = signal<IntervencionPanel>({})

  private intervencionService = inject(IntervencionService)

  ngOnInit(): void {
    this.obtenerIntervencionPanelService()
  }

  obtenerIntervencionPanelService(){
    this.intervencionService.ListarIntervencionEtapas(this.pagination).subscribe( resp => this.intervenciones.set(resp.data))
  }
}
