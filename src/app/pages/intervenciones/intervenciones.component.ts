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
import { AuthService } from '@libs/services/auth/auth.service';

@Component({
  selector: 'app-intervenciones',
  standalone: true,
  imports: [CommonModule, NgZorroModule, IntervencionPanelInfoComponent, IntervencionPanelMapaComponent, IntervencionPanelSectorComponent, IntervencionPanelNivelGobiernoComponent, IntervencionPanelUbigeoComponent, IntervencionPanelEstadoComponent, IntervencionPanelAptosComponent, IntervencionPanelFiltrosComponent],
  templateUrl: './intervenciones.component.html',
  styles: ``
})
export default class IntervencionesComponent {
  title: string = `Intervenciones`;

  sectorAuth: number = 0
  permisosPcm: boolean = false

  pagination: Pagination = { tipoEspacioId: '2' }
  filter = signal<Pagination>({ tipoEspacioId: '2' })
  intervenciones = signal<IntervencionPanel>({})

  private intervencionService = inject(IntervencionService)
  private authStore = inject(AuthService)

  ngOnInit(): void {
    this.setPermisosPCM()
    this.obtenerIntervencionPanelService()
  }

  setPermisosPCM(){
    this.sectorAuth = Number(this.authStore.usuarioAuth().sector!.value) ?? 0
    const permisosStorage = localStorage.getItem('permisosPcm') ?? ''
    this.permisosPcm = JSON.parse(permisosStorage) ?? false
  }

  obtenerIntervencionPanelService(){
    if(!this.permisosPcm){
      this.pagination.sectorId = this.sectorAuth
    }
    this.intervencionService.ListarIntervencionEtapas(this.pagination).subscribe( resp => this.intervenciones.set(resp.data))
  }

  getFilterPagination(pagination: Pagination){
    this.pagination = pagination
    this.obtenerIntervencionPanelService()  
  }

  getIdPanel(id:Number, panel: string){
    switch (panel) {
      case 'ubigeo': this.pagination.entidadUbigeoId = `${id}`, this.pagination.nivelUbigeo = '1'; break;
      case 'sector': this.pagination.sectorId = id; break;
      case 'nivelGobierno': this.pagination.nivelGobiernoId = `${id}`; break;
    }
    this.filter.update( f => ({
      ...f,
      entidadUbigeoId: this.pagination.entidadUbigeoId,
      sectorId: this.pagination.sectorId,
      nivelGobiernoId: this.pagination.nivelGobiernoId
    }))
    
    this.obtenerIntervencionPanelService()  
  }
}
