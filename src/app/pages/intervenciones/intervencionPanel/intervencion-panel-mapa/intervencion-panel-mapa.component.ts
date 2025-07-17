import { CommonModule } from '@angular/common';
import { Component, inject, Input, SimpleChanges } from '@angular/core';
import { departamentosTopoJSON } from '@core/helpers';
import { GeoTopoJson, Pagination, UbigeoTopoJson } from '@core/interfaces';
import { InterfacePanelResult } from '@core/interfaces/intervencion.interface';
import { CardComponent } from '@shared/card/card.component';
import { GeoMapComponent } from "../../../../shared/geo-map/geo-map.component";
import { EntidadesService } from '@core/services';

@Component({
  selector: 'app-intervencion-panel-mapa',
  standalone: true,
  imports: [CommonModule, CardComponent, GeoMapComponent],
  templateUrl: './intervencion-panel-mapa.component.html',
  styles: ``
})
export class IntervencionPanelMapaComponent {
  @Input() intervencionUbigeo: InterfacePanelResult[] = []
  @Input() pagination!: Pagination
  dataTopoJson: UbigeoTopoJson[] = departamentosTopoJSON()
  geoTopoJson: GeoTopoJson = { geo: 'departamentos', ubigeo: 'departamentos' }

  
  private entidadService = inject(EntidadesService)

  ngOnChanges(changes: SimpleChanges): void {
    this.setIntervencionUbigeo()
    
  }
  
  setIntervencionUbigeo(){
    const newData: UbigeoTopoJson[] = [ ...this.dataTopoJson ]
     for(let data of newData){
      const intervencion = this.intervencionUbigeo.find((item:InterfacePanelResult) => item.nombre == data.nombre)
      if(intervencion){
        data.porcentaje = `${intervencion.avance.toFixed(1)} %` 
      }      
    }

    this.dataTopoJson = newData
    
    if( this.pagination.entidadUbigeoId && this.pagination.nivelUbigeo ){
      const entidadId = this.pagination.entidadUbigeoId
      const nivelUbigeo = Number(this.pagination.nivelUbigeo)
      this.obtenerEntidadPorId(entidadId, nivelUbigeo)
    }
  }

  obtenerEntidadPorId(entidadId: string, nivelUbigeo: number ){
    this.entidadService.getEntidadPorId(entidadId)
      .subscribe( resp => {
        const entidad = resp.data[0]
        let ubigeo =  entidad.ubigeo
        if(nivelUbigeo == 1){
          ubigeo = ubigeo.slice(0,2)
        }
        const geo = nivelUbigeo == 1 ? 'provincias' : 'distritos'
        this.geoTopoJson = { geo, ubigeo }        
      })
  }

  ngOnDestroy(): void {
    this.setIntervencionUbigeo()
  }
}
